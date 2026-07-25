import { _wcl } from './common-lib.js';
import Mustache from './mustache.js';

const template = document.createElement('template');
template.innerHTML = `
{{#units}}
<a href="{{url}}" class="md3-search__results__a">
  <img src="{{thumbnail}}" />
  <div class="md3-search__results__a__div">
    <p class="md3-search__results__a__div__title">{{title}}</p>
  </div>
</a>
{{/units}}
`;

await customElements.whenDefined('msc-built-in-ai-embedding');

const ai = document.querySelector('msc-built-in-ai-embedding');
const input = document.querySelector('.md3-search input[type=search]');
const results = document.querySelector('.md3-search__results');
const search = document.querySelector('.md3-search');

const debounce = 300;
const storeId = 'Y2386808314';
let listingDB = [];
let iid = '';

const getTotalCount = async () => {
  const api = new URL('https://tw.search.ec.yahoo.com/api/uther/v3/auction/inStoreSearch');
  const params = {
    spaceId: 'msc-built-in-ai-embedding',
    storeId
  };
  Object.keys(params).forEach((key) => api.searchParams.set(key, params[key]));

  const { totalCount } = await fetch(api.toString(), { mode: 'cors' })
    .then((response) => response.json());

  return totalCount;
};

const setupListingDB = async () => {
  try {
    const totalCount = await getTotalCount();
    const chunkSize = 60;
    const chunks = new Array(Math.ceil(totalCount / chunkSize)).fill(null);

    const resArray = await Promise.all(
      chunks.map(
        (U, index) => {
          const api = new URL('https://tw.search.ec.yahoo.com/api/uther/v3/auction/inStoreSearch');
          const params = {
            spaceId: 'msc-built-in-ai-embedding',
            storeId,
            offset: index * chunkSize,
            hits: chunkSize
          };
          Object.keys(params).forEach((key) => api.searchParams.set(key, params[key]));

          return fetch(api.toString(), { mode: 'cors' })
                  .then((response) => response.json())
                  .catch((error) => { return { error }; });

        }
      )
    );

    const rawProducts = resArray.reduce(
      (acc, cur) => {
        const {
          products = []
        } = cur;

        return acc.concat(products);
      }
    , []);

    listingDB = rawProducts.reduce(
      (acc, product) => {
        const {
          productId: id = '',
          title = '',
          productURL: url = '',
          marketPrice,
          currentPrice,
          productImages = []
        } = product;


        return acc.concat({
          id,
          title,
          url,
          price: currentPrice ? +currentPrice : +marketPrice,
          thumbnail: productImages[0]?.small?.url ?? 'https://img.yec.tw/ma/auc/item/icon/item-no-image.svg',
          embedding: []
        })
      }
    , []);
  } catch(err) {
    console.log(err);
  }
};

const onInput = (evt) => {
  clearTimeout(iid);

  if (evt.isComposing) {
    return;
  }

  iid = setTimeout(
    () => doSearch()
  , debounce);
};

const onCompositionend = () => {
  doSearch();
};

const doSearch = async () => {
  const value = input.value.trim();

  clearTimeout(iid);

  results.toggleAttribute('data-active', false);

  if (!value) {
    return;
  }

  try {
    const THRESHOLD = 0.35;

    performance.mark('started');

    await ai.create();
    
    const { embeddings = [] } = await ai.embed(value, { taskType: "retrieval-query" });
    const vector = embeddings[0].values;
    ai.destroy();

    performance.mark('ended');
    const measure = performance.measure('duration', 'started', 'ended');
    // console.log('measure', measure.duration);

    // console.log(vector);

    const db = window.structuredClone(listingDB)
      .map(
        (listing) => {
          const { embedding } = listing;
          const score = ai.cosineSimilarity(vector, embedding);
          // console.log(score)

          return {
            ...listing,
            score
          }
        }
      )
      .filter((listing) => listing.score >= THRESHOLD)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    results.replaceChildren();
    const contentString = Mustache.render(template.innerHTML,
      {
        units: db.map(
          (listing) => {
            const { title, url, thumbnail } = listing;

            return {
              url,
              thumbnail,
              title
            }
          }
        )
      }
    );
    results.insertAdjacentHTML('beforeend', contentString);
    results.toggleAttribute('data-active', db.length > 0);
  } catch(err) {
    console.log(err);
  }
};

/*
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};
*/

async function init() {
  if (['unavailable', 'unsupported'].includes(ai.status)) {
    return;
  }

  await setupListingDB();

  // embedding
  const sentences = listingDB.map(
    (listing) => {
      return listing.title;
    }
  );

  try {
    performance.mark('started');

    await ai.create();
    
    const { embeddings = [] } = await ai.embed(sentences, { taskType: "retrieval-document" });
    
    ai.destroy();

    performance.mark('ended');
    const measure = performance.measure('duration', 'started', 'ended');
    // console.log('measure', measure.duration);

    embeddings.forEach(
      (embedding, index) => {
        const { values } = embedding;

        if (listingDB[index]?.embedding) {
          listingDB[index].embedding = values;
        }
      }
    );

    // console.log(listingDB);
    search.inert = false;

    const snackbar = document.querySelector('#sys-snackbar');
    
    if (snackbar) {
      snackbar.show('Product search is now available.');
    }
  } catch(err) {
    console.log(err)
  }

  // events
  input.addEventListener('input', onInput);
  input.addEventListener('compositionend', onCompositionend);
}

init();
