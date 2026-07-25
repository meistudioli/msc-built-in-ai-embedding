# msc-built-in-ai-embedding


[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/msc-details) [![DeepScan grade](https://deepscan.io/api/teams/16372/projects/32162/branches/1047906/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=16372&pid=32162&bid=1047906)

&lt;msc-built-in-ai-embedding /> is a web component based on [Chrome Built-in AI Semantic Embedder API](https://docs.google.com/document/d/1ZB6MW8UDczm4V6ej5MorZWqFCYWwLhUs5HKxEdjP35c/edit?tab=t.0). Web developers could use &lt;msc-built-in-ai-embedding /> to generate vector embeddings with EmbeddingGemma and provide vivid features like semantic search or text similarity comparison.

&lt;msc-built-in-ai-embedding /> is a non-UI component. But it will provide current status in `data-status`. That means web developers have maximum creation to build UI through this information.

![&lt;msc-built-in-ai-embedding />](https://blog.lalacube.com/mei/img/preview/msc-built-in-ai-embedding.png)

## Basic Usage

&lt;msc-built-in-ai-embedding /> is a web component. All we need to do is put the required script into your HTML document. Then follow &lt;msc-built-in-ai-embedding />'s html structure and everything will be all set.

- Required Script

  ```html
  <script
    type="module"
    src="https://unpkg.com/msc-built-in-ai-embedding/mjs/wc-msc-built-in-ai-embedding.js">        
  </script>
  ```

- Structure

  Put &lt;msc-built-in-ai-embedding /> into HTML document. It will have different functions and looks with attribute mutation.

  ```html
  <msc-built-in-ai-embedding>
    <!-- style by yourself -->
    <button type="button">
      Try AI features
    </button>
  </msc-built-in-ai-embedding>
  ```

There will be serverial status to indicate Built-in AI status. Check `msc-built-in-ai-embedding[data-status]` out.

- `available`：AI ready to use.
- `downloadable`：Need to download LLM first (browser supported).
- `downloading`：LLM downloading (browser supported).
- `unsupported`：current browser doesn't support Built-in AI Semantic Embedder API.
- `unavailable`：current browser doesn't support Built-in AI Semantic Embedder API.

Once &lt;msc-built-in-ai-embedding /> in status: downloading, &lt;msc-built-in-ai-embedding /> will show download progress in attribute `data-progress`.

Such as:

```html
<msc-built-in-ai-embedding
  data-status="downloading"
  data-progress="45"
>
  <button type="button">
    Try AI features
  </button>
</msc-built-in-ai-embedding>
```

## JavaScript Instantiation

&lt;msc-built-in-ai-embedding /> could also use JavaScript to create DOM element. Here comes some examples.

```html
<script type="module">
import { MscBuiltInAiEmbedding } from 'https://unpkg.com/msc-built-in-ai-embedding/mjs/wc-msc-built-in-ai-embedding.js';

const buttonTemplate = document.querySelector('.my-button-template');

// use DOM api
const nodeA = document.createElement('msc-built-in-ai-embedding');
document.body.appendChild(nodeA);
nodeA.appendChild(buttonTemplate.content.cloneNode(true));

// new instance with Class
const nodeB = new MscBuiltInAiEmbedding();
document.body.appendChild(nodeB);
nodeB.appendChild(buttonTemplate.content.cloneNode(true));
</script>
```

## Use &lt;msc-built-in-ai-embedding />

&lt;msc-built-in-ai-embedding /> provide same method as Chrome Built-in AI Semantic Embedder API. That means web developers need to `create()` embedder before `embed()`.

- Embed a single string

```html
<script type="module">
const ai = document.querySelector('msc-built-in-ai-embedding');

if (['unavailable', 'unsupported'].includes(ai.status)) {
  console.log('The current browser does not support the Built-in AI Semantic Embedder API.');
} else {
  try {
    await ai.create();
    const result = await ai.embed(
      "The quick brown fox jumps over the lazy dog.",
      { taskType: "semantic-similarity" }
    );
    ai.destroy();

    console.log(result);
  } catch(err) {
    console.log(err);
  }
}
</script>
```

- Embed a batch of strings

```html
<script type="module">
const ai = document.querySelector('msc-built-in-ai-embedding');

if (['unavailable', 'unsupported'].includes(ai.status)) {
  console.log('The current browser does not support the Built-in AI Semantic Embedder API.');
} else {
  try {
    await ai.create();
    const result = await ai.embed(
      [
        "Built-in AI APIs use on-device models.",
        "Embeddings are high-dimensional vectors representing semantic meaning.",
      ],
      { taskType: "semantic-similarity" }
    );
    ai.destroy();

    console.log(result);
  } catch(err) {
    console.log(err);
  }
}
</script>
```

## Property
| Property Name | Type | Description |
| ----------- | ----------- | ----------- |
| status | String | Getter current status. (`available`、`downloadable`、`downloading`、`unsupported`、`unavailable`) |

## Mathods
| Mathod Signature | Description |
| ----------- | ----------- |
| create() | Create the embedder instance. |
| embed(string = '' [, options = {}]) | Embed a single string or batch of strings. The embed function takes an optional parameter called [taskType](https://docs.google.com/document/d/1ZB6MW8UDczm4V6ej5MorZWqFCYWwLhUs5HKxEdjP35c/edit?tab=t.0#heading=h.f9lt6hmd71bq) which allows you to optimize the embedding quality for specific use cases. |
| destroy() | Destroy current embedder instance. |

※ Note: Except for destroy(), all the above methods are async.

## Events
| Event Signature | Description |
| ----------- | ----------- |
| msc-built-in-ai-embedding-ready | Fired when LLM download done. |
| msc-built-in-ai-embedding-download-progress | Fired when LLM downloading. Developers could gather result information through `event.detail`. |

## Reference
- [&lt;msc-built-in-ai-embedding /> demo](https://blog.lalacube.com/mei/webComponent_msc-built-in-ai-embedding.html)
- [Built-in AI Semantic Embedder API](https://docs.google.com/document/d/1ZB6MW8UDczm4V6ej5MorZWqFCYWwLhUs5HKxEdjP35c/edit?tab=t.0)
- [YouTube tutorial](https://youtube.com/shorts/RTZn5x8vIXE)
- [WEBCOMPONENTS.ORG](https://www.webcomponents.org/element/msc-built-in-ai-embedding)
