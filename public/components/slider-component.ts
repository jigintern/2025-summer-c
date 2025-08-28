// slider-component.ts

// @ts-ignore
import noUiSlider from 'https://cdn.jsdelivr.net/npm/nouislider/+esm';
// ★ 1. 必要なものをインポート
import { map, allPosts } from '../map.ts';
import { filterMapByDecade } from './filter.ts';

const sliderContent = `
  <style>
    @import url('https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.7.1/nouislider.min.css');
    :host { display: block; padding: 30px 20px; }
    .slider-label { margin-bottom: 20px; }
    .selected-range { font-weight: bold; }
    :host .noUi-connect { background: var(--accent-color, #007bff); }
       .slider-label {
        font-size: 1rem;
        margin-bottom: 20px;
        color: var(--text-color, #333);
    }
    :host .noUi-handle { 
        width: 30px;
        
        height: 30px;
        border-radius: 50%; /* これが円形にしています */
        border-color: var(--accent-color, #007bff);
        box-shadow: none;
        top: -6px;
        right: -11px;
 }
   .selected-range {
        font-weight: bold;
    }
    
    .selected-range {
        font-weight: bold;
    }
    
    
    :host .noUi-handle::before,
    :host .noUi-handle::after {
        content: "";
        display: block;
        position: absolute;
        height: 12px; /* マークの高さ */
        width: 1px;  /* マークの太さ */
        background: rgb(007bff) /* マークの色 */
        top: 8px;    /* 上からの位置 */
    }

    /* 1本目の線の左からの位置 */
    :host .noUi-handle::before {
        left: 11px;
    }

    /* 2本目の線の左からの位置 */
    :host .noUi-handle::after {
        left: 15px;
    }
  </style>
  <div class="slider-container">
    <div class="slider-label">年代: <span class="selected-range"></span></div>
    <div id="year-slider"></div>
  </div>
`;

class SliderComponent extends HTMLElement {
    private slider: noUiSlider.API | null = null;
    private rangeDisplay: HTMLElement | null = null;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        if (!this.shadowRoot) return;
        this.shadowRoot.innerHTML = sliderContent;

        const sliderElement = this.shadowRoot.querySelector('#year-slider') as HTMLElement;
        this.rangeDisplay = this.shadowRoot.querySelector('.selected-range');

        if (sliderElement) {
            this.slider = noUiSlider.create(sliderElement, {
                start: [1900, 2100],
                connect: true,
                range: { 'min': 1900, 'max': 2100 },
                step: 10,
                margin: 10,
                tooltips: false,
                format: {
                    to: (value) => Math.round(value) + '年',
                    from: (value) => Number(value.replace('年', ''))
                }
            });

            this.slider.on('update', (values, handle) => {
                if (this.rangeDisplay) {
                    this.rangeDisplay.textContent = `${values[0]} - ${values[1]}`;
                }
            });

            // ★ 2. 'change'イベントの処理を変更
            // マウス操作が終わったら、イベントを発火する代わりに直接フィルター関数を呼び出す
            this.slider.on('change', (values, handle) => {
                const numericValues = values.map(v => Number(String(v).replace('年', '')));
                const [startYear, endYear] = numericValues;

                // インポートした関数を直接呼び出す
                filterMapByDecade(map, allPosts, startYear, endYear);

                // (任意) ページ上のテキストも更新
                const resultDisplay = document.querySelector<HTMLSpanElement>('#result');
                if (resultDisplay) {
                    resultDisplay.textContent = `${startYear}年 〜 ${endYear}年`;
                }
            });
        }
    }

    disconnectedCallback() {
        if (this.slider) {
            this.slider.destroy();
        }
    }
}

customElements.define('slider-component', SliderComponent);
