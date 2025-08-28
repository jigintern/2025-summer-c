// slider-component.ts

// noUiSliderライブラリの型定義（TypeScriptで利用する場合）
// @ts-ignore
import noUiSlider from 'https://cdn.jsdelivr.net/npm/nouislider/+esm';

const sliderContent = `
  <style>
    /* noUiSliderの基本的なスタイルをShadow DOM内に直接読み込む */
    @import url('https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/15.7.1/nouislider.min.css');

    :host {
      display: block;
      padding: 30px 20px;
    }

    .slider-label {
      font-size: 1rem;
      margin-bottom: 20px;
      color: var(--text-color, #333);
    }
    
    .selected-range {
        font-weight: bold;
    }

    /* スライダーのつまみの色などをカスタマイズ */
    :host .noUi-connect {
        background: var(--accent-color, #007bff);
    }

    :host .noUi-handle {
        border-radius: 50%;
        border-color: var(--accent-color, #007bff);
        box-shadow: none;
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
                start: [1980, 2010],
                connect: true,
                range: {
                    'min': 1950,
                    'max': 2030
                },
                step: 10,
                margin: 10, // つまみ同士の最小間隔
                tooltips: true, // つまみの上に値を表示
                format: {
                    to: (value) => Math.round(value) + '年',
                    from: (value) => Number(value.replace('年', ''))
                }
            });

            // スライダーの値が変更されたときのイベント
            this.slider.on('update', (values, handle) => {
                if (this.rangeDisplay) {
                    // "1980年 - 2010年" のように表示を更新
                    this.rangeDisplay.textContent = `${values[0]} - ${values[1]}`;
                }
            });

            // マウス操作が終わったときにカスタムイベントを発火
            this.slider.on('change', (values, handle) => {
                const numericValues = values.map(v => Number(String(v).replace('年', '')));
                this.dispatchEvent(new CustomEvent('rangeChange', {
                    detail: {
                        range: numericValues
                    },
                    bubbles: true,
                    composed: true
                }));
            });
        }
    }

    disconnectedCallback() {
        // コンポーネントがDOMから削除されたらスライダーを破棄
        if (this.slider) {
            this.slider.destroy();
        }
    }
}

customElements.define('slider-component', SliderComponent);