class NumberSelector extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        
        const shadow = this.attachShadow({mode: 'open'});

        const backDrop = document.createElement("section");
        backDrop.setAttribute("class", "grid-container");

        const label = document.createElement("span");
        label.setAttribute("class", "number-selector-label");
        const text = document.createTextNode(this.attributes.text.value || "");
        label.appendChild(text);
        
        const amountWrapper = document.createElement("span");
        amountWrapper.setAttribute("class", "number-selector-amount");
        const amount = document.createTextNode(this.attributes.defaultAmount || 1);
        this.setAttribute("amount", Number(amount.textContent));
        amountWrapper.appendChild(amount);

        const btnInc = document.createElement("button");
        btnInc.setAttribute("class", "number-selector-btn-inc");
        btnInc.appendChild(document.createTextNode("+"));
        btnInc.addEventListener("click", () => {
            if (Number(amount.textContent) < (this.attributes.maxAmount || 10))
                amount.textContent = Number(amount.textContent) + 1;
            this.setAttribute("amount", Number(amount.textContent));
        });

        const btnDec = document.createElement("button");
        btnDec.setAttribute("class", "number-selector-btn-dec");
        btnDec.appendChild(document.createTextNode("-"));
        btnDec.addEventListener("click", () => {
            if (Number(amount.textContent) > (this.attributes.minAmount || 1))
                amount.textContent = Number(amount.textContent) - 1;
            this.setAttribute("amount", Number(amount.textContent));
        });

        backDrop.appendChild(label);
        backDrop.appendChild(amountWrapper);
        backDrop.appendChild(btnInc);
        backDrop.appendChild(btnDec);

        const style = document.createElement("style");
        style.textContent = `
        .grid-container {
            width: 90vw;
            max-width: 500px;
            height: 50px;
            display: grid;
            grid-template-columns: 84% 6% 10%;
            grid-template-rows: 50% 50%;
            background-color: #0CBABA;
            padding: 2px;
            margin-left: 400px;
            margin-right: 400px;
            font-size: 30px;
            border-radius: 10px;
            color: white;
        }
        
        .number-selector-label {
            grid-column: 1;
            grid-row-start: 1;
            grid-row-end: 2;
            margin-top: 6px;
            margin-left: 10px;
        }
        
        .number-selector-amount {
            grid-column: 2;
            grid-row-start: 1;
            grid-row-end: 2;
            margin-top: 6px;
        }
        
        .number-selector-btn-inc {
            grid-column: 3;
            grid-row: 1;
            height: 100%;
            width: 100%;
            border-radius: 10px;
            border: none;
            background-color: transparent;
        }
        
        .number-selector-btn-dec {
            grid-column: 3;
            grid-row: 2;
            height: 100%;
            width: 100%;
            border: none;
            background-color: transparent;
        }
        `;

        shadow.append(style, backDrop);
    }

}

customElements.define("number-selector", NumberSelector)