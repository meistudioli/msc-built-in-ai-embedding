import { _wcl } from 'https://unpkg.com/msc-built-in-ai-prompt/mjs/common-lib.js';
import { _wccss } from 'https://unpkg.com/msc-built-in-ai-prompt/mjs/common-css.js';

const defaults = {};
const booleanAttrs = []; // booleanAttrs default should be false
const objectAttrs = [];
const custumEvents = {
  ready: 'msc-built-in-ai-embedding-ready',
  progress: 'msc-built-in-ai-embedding-download-progress',
};
const supported = !!window.SemanticEmbedder;

const template = document.createElement('template');
template.innerHTML = `
<style>
${_wccss}

:host {
  --display: none;

  position: relative;
  inline-size: fit-content;
  display: var(--display);
}

:host(:not([data-status=unsupported],[data-status=available],[data-status=unavailable])) {
  --display: block;
}

.main {
  inline-size: fit-content;
  block-size: fit-content;
}
</style>

<div class="main" ontouchstart="">
  <slot></slot>
</div>
`;

export class MscBuiltInAiEmbedding extends HTMLElement {
  #data;
  #nodes;
  #config;

  constructor(config) {
    super();

    // template
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    // data
    this.#data = {
      controller: '',
      session: ''
    };

    // nodes
    this.#nodes = {
      slot: this.shadowRoot.querySelector('slot')
    };

    // config
    this.#config = {
      ...defaults,
      ...config // new MscBuiltInAiEmbedding(config)
    };

    // evts
    this._onClick = this._onClick.bind(this);
  }

  async connectedCallback() {
   const { config, error } = await _wcl.getWCConfig(this);

    if (error) {
      console.warn(`${_wcl.classToTagName(this.constructor.name)}: ${error}`);
      this.remove();
      return;
    } else {
      this.#config = {
        ...this.#config,
        ...config
      };
    }

    // upgradeProperty
    Object.keys(defaults).forEach((key) => this.#upgradeProperty(key));

    // evts
    this.#data.controller = new AbortController();
    const signal = this.#data.controller.signal;
    this.#nodes.slot.addEventListener('click', this._onClick, { signal });
  
    // init
    await this.#statusCheck();
    if (this.status === 'available') {
      this.#fireEvent(custumEvents.ready);
    }
  }

  disconnectedCallback() {
    this.#data.controller.abort?.();
  }

  static get observedAttributes() {
    return Object.keys(defaults); // MscBuiltInAiEmbedding.observedAttributes
  }

  static get supportedEvents() {
    return Object.keys(custumEvents).map(
      (key) => {
        return custumEvents[key];
      }
    );
  }

  #upgradeProperty(prop) {
    let value;

    if (MscBuiltInAiEmbedding.observedAttributes.includes(prop)) {
      if (Object.prototype.hasOwnProperty.call(this, prop)) {
        value = this[prop];
        delete this[prop];
      } else {
        if (booleanAttrs.includes(prop)) {
          value = (this.hasAttribute(prop) || this.#config[prop]) ? true : false;
        } else if (objectAttrs.includes(prop)) {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : JSON.stringify(this.#config[prop]);
        } else {
          value = this.hasAttribute(prop) ? this.getAttribute(prop) : this.#config[prop];
        }
      }

      this[prop] = value;
    }
  }

  async #statusCheck() {
    this.#config.status = !supported
      ? 'unsupported'
      : await window.SemanticEmbedder.availability();

    this.dataset.status = this.#config.status;
  }

  get status() {
    return this.#config.status;
  }

  #fireEvent(evtName, detail) {
    this.dispatchEvent(new CustomEvent(evtName,
      {
        bubbles: true,
        composed: true,
        ...(detail && { detail })
      }
    ));
  }

  async #progress(evt) {
    const { loaded, total = 1 } = evt;
    const progress = Math.floor((loaded / total) * 100);

    if (progress === 100) {
      this.toggleAttribute('data-progress', false);
      await this.#statusCheck();
      this.#fireEvent(custumEvents.ready);
    } else {
      this.dataset.status = 'downloading';
      this.dataset.progress = progress;
      this.#fireEvent(custumEvents.progress, { progress });
    }
  }

  async _onClick() {
    if (['unavailable', 'unsupported'].includes(this.status)) {
      throw new Error(`The current browser does not support the Built-in AI Semantic Embedder API.`);
    }

    await this.#statusCheck();

    if (this.status === 'downloadable') {
      await this.create();
    }
  }

  destroy() {
    this.#data.session?.destroy?.();
  }

  async create() {
    if (['unavailable', 'unsupported'].includes(this.status)) {
      throw new Error(`The current browser does not support the Built-in AI Semantic Embedder API.`);
    }

    this.destroy();

    this.#data.session = await window.SemanticEmbedder.create();
  }

  async embed(data, option = {}) {
    if (['unavailable', 'unsupported'].includes(this.status)) {
      throw new Error(`The current browser does not support the Built-in AI Semantic Embedder API.`);
    }

    if (!this.#data.session?.embed) {
      await this.create();
    }

    return this.#data.session.embed(data, option);
  }

  cosineSimilarity(vecA, vecB) {
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
  }
}

// define web component
const S = _wcl.supports();
const T = _wcl.classToTagName('MscBuiltInAiEmbedding');
if (S.customElements && S.shadowDOM && S.template && !window.customElements.get(T)) {
  window.customElements.define(_wcl.classToTagName('MscBuiltInAiEmbedding'), MscBuiltInAiEmbedding);
}