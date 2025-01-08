const OM_APP_HOST = "localhost";
const OM_APP_PORT = "7777";
const OM_APP_ADDR = "http://" + OM_APP_HOST + ":" + OM_APP_PORT;
const OM_APP_API = OM_APP_ADDR + "/api/v1";

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

function parseDate(rawDate)
{
    var tomorrow = new Date(rawDate.substring(0, 10));
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const yyyy = tomorrow.getFullYear();
    return (yyyy + '-' + mm + '-' + dd);
}


class App {
    #orderlists = [];
    
    #items = [];

    #defaultItemName = '';

    #currentDate;

    onEditOrder = ({ orderlistID }) => {
        const orderlist = this.#orderlists.find(
            orderlist => orderlist.orderlistID === orderlistID
        );
        if(!orderlist) {
            console.error(`Отсутствует заказ с ID = ${orderlistID}`);
            return;
        }

        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__controls`).style.display = 'none';

        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__client`).style.display = 'none';
        const currentClient = document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__client`).innerHTML.replace('Заказчик: ', '');
        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__date`).style.display = 'none';
        const currentDate = document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__date`).innerHTML.replace('Дата: ', '');

        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > input.orderlist__header__edit-client`).style.display = 'initial';
        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > input.orderlist__header__edit-client`).value = currentClient;

        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > input.orderlist__header__edit-date`).style.display = 'initial';
        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > input.orderlist__header__edit-date`).value = currentDate;

        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__edit__controls`).style.display = 'grid';
    };

    onEditOrderApply = ({ orderlistID }) => {
        const orderlist = this.#orderlists.find(
            orderlist => orderlist.orderlistID === orderlistID
        );
        if(!orderlist) {
            console.error(`Отсутствует заказ с ID = ${orderlistID}`);
            return;
        }

        try {
            const currentClient = document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__client`).innerHTML.replace('Заказчик: ', '');
            const currentDate = document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__date`).innerHTML.replace('Дата: ', '');
            const newClient = document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > input.orderlist__header__edit-client`).value;
            const newDate = document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > input.orderlist__header__edit-date`).value;
            if((!newClient) || (!newDate)) {
                alert("Недопустимые параметры");
                return;
            }

            if((newClient == currentClient) && (newDate == currentDate)) {
                document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__controls`).style.display = 'grid';

                document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__client`).style.display = 'inherit';
                document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__date`).style.display = 'inherit';

                document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > input.orderlist__header__edit-client`).style.display = 'none';
                document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > input.orderlist__header__edit-date`).style.display = 'none';

                document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__edit__controls`).style.display = 'none';

                return;
            }

            var req = new XMLHttpRequest();
            req.open("PATCH", OM_APP_API + "/orderlists/" + orderlistID, false);
            req.setRequestHeader("Content-Type", "application/json");
            req.send(`{
                "orderlistClient": "${newClient}",
                "orderlistDate": "${newDate}"
            }`);
    
            if(req.status != 200)
            {
                throw("Не удалось изменить заказ. Ошибка: " + req.status);
            }

            document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__date`).innerHTML = 'Дата: ' + newDate;
            document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__client`).innerHTML = 'Заказчик: ' + newClient;

            document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__controls`).style.display = 'grid';

            document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__client`).style.display = 'inherit';
            document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__date`).style.display = 'inherit';

            document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > input.orderlist__header__edit-client`).style.display = 'none';
            document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > input.orderlist__header__edit-date`).style.display = 'none';

            document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__edit__controls`).style.display = 'none';
        } catch (error) {
            alert(error);
        }
    };

    onEditOrderCancel = ({ orderlistID }) => {
        const orderlist = this.#orderlists.find(
            orderlist => orderlist.orderlistID === orderlistID
        );
        if(!orderlist) {
            console.error(`Отсутствует заказ с ID = ${orderlistID}`);
            return;
        }

        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__controls`).style.display = 'grid';

        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__client`).style.display = 'inherit';
        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__date`).style.display = 'inherit';

        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > input.orderlist__header__edit-client`).style.display = 'none';
        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > input.orderlist__header__edit-date`).style.display = 'none';

        document.querySelector(`li[id="${orderlistID}"] > header.orderlist__header > div.orderlist__header__edit__controls`).style.display = 'none';
    };

    deleteOrder = ({ orderlistID }) => {
        var index, len;
        for (index = 0, len = this.#orderlists.length; index < len; ++index) {
            if(this.#orderlists.at(index).orderlistID === orderlistID) {
                this.#orderlists.splice(index, 1);
                break;
            }
        }
    }

    onDeleteOrder = ({ orderlistID }) => {
        const orderlist = this.#orderlists.find(
            orderlist => orderlist.orderlistID === orderlistID
        );
        if(!orderlist) {
            console.error(`Отсутствует заказ с ID = ${orderlistID}`);
            return;
        }

        const orderIsDeleted = confirm(`Заказ будет удален. Продолжить?`);
        if(!orderIsDeleted) return;

        try {
            var req = new XMLHttpRequest();
            req.open("DELETE", OM_APP_API + "/orderlists/" + orderlistID, false);
            req.send();
    
            if(req.status != 200)
            {
                throw("Не удалось удалить заказ. Ошибка: " + req.status);
            }

            this.deleteOrder({ orderlistID });
            document.querySelector(`li[id="${orderlistID}"]`).remove();

        } catch (error) {
            alert(error);
        }
    };

    onEditOrderposition = ({ orderpositionID, orderlistID }) => {
        const orderlist = this.#orderlists.find(
            orderlist => orderlist.orderlistID === orderlistID
        );
        if(!orderlist) {
            console.error(`Отсутствует заказ с ID = ${orderlistID}`);
            return;
        }

        const orderposition = orderlist.getOrderposition({ orderpositionID });
        if(!orderposition) {
            console.error(`В заказе с ID = ${orderlistID} отсутствует позиция с ID = ${orderpositionID}`);
            return;
        }

        document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__info`).style.display = 'none';
        document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__controls`).style.display = 'none';

        document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__edit`).style.display = 'grid';

        const currentItem = document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__info > span.orderposition__info__item-name`).innerHTML.replace("Товар: ", '');
        const currentAmount = document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__info > span.orderposition__info__amount`).innerHTML.replace("Количество: ", '');

        document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__edit > div.orderposition__edit__input > input.orderposition__edit__input__amount`).value = currentAmount;

        const selectEl = document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__edit > div.orderposition__edit__input > select.orderposition__edit__input__item`);
        const selectOptions = selectEl.options;
        for (var opt, j = 0; opt = selectOptions[j]; j++) {
            if (opt.value == currentItem) {
                selectEl.selectedIndex = j;
              break;
            }
        }
    };

    onEditOrderpositionApply = ({ orderpositionID, orderlistID }) => {
        const orderlist = this.#orderlists.find(
            orderlist => orderlist.orderlistID === orderlistID
        );
        if(!orderlist) {
            console.error(`Отсутствует заказ с ID = ${orderlistID}`);
            return;
        }

        const orderposition = orderlist.getOrderposition({ orderpositionID });
        if(!orderposition) {
            console.error(`В заказе с ID = ${orderlistID} отсутствует позиция с ID = ${orderpositionID}`);
            return;
        }

        const currentItem = document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__info > span.orderposition__info__item-name`).innerHTML.replace("Товар: ", '');
        const currentAmount = document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__info > span.orderposition__info__amount`).innerHTML.replace("Количество: ", '');
        const newItem = document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__edit > div.orderposition__edit__input > select.orderposition__edit__input__item`).value;
        const newAmount = document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__edit > div.orderposition__edit__input > input.orderposition__edit__input__amount`).value;
        
        if((!newItem) || (!newAmount) || (newAmount < 1)) {
            alert("Недопустимые параметры");
            return;
        }

        if((newItem !== currentItem) || (newAmount !== currentAmount))
        {
            try {
                var req = new XMLHttpRequest();
                req.open("PATCH", OM_APP_API + "/orderpositions/" + orderpositionID, false);
                req.setRequestHeader("Content-Type", "application/json");
                req.send(`{
                    "orderpositionItem": "${newItem}",
                    "orderpositionAmount": ${newAmount}
                }`);
        
                switch (req.status) {
                    case 200:
                        break;
                    case 499:
                        throw("Недостаточно товара на складе");
                    default:
                        throw("Не удалось изменить позицию. Ошибка: " + req.status);
                }
                
                document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__info > span.orderposition__info__item-name`).innerHTML = "Товар: " + newItem;
                document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__info > span.orderposition__info__amount`).innerHTML = "Количество: " + newAmount;
    
                document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__info`).style.display = 'grid';
                document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__controls`).style.display = 'grid';
    
                document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__edit`).style.display = 'none';
    
            } catch (error) {
                alert(error);
            }
        }
        else
        {
            document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__info`).style.display = 'grid';
            document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__controls`).style.display = 'grid';
    
            document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__edit`).style.display = 'none';
        }
    };

    onEditOrderpositionCancel = ({ orderpositionID, orderlistID }) => {
        const orderlist = this.#orderlists.find(
            orderlist => orderlist.orderlistID === orderlistID
        );
        if(!orderlist) {
            console.error(`Отсутствует заказ с ID = ${orderlistID}`);
            return;
        }

        const orderposition = orderlist.getOrderposition({ orderpositionID });
        if(!orderposition) {
            console.error(`В заказе с ID = ${orderlistID} отсутствует позиция с ID = ${orderpositionID}`);
            return;
        }

        document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__info`).style.display = 'grid';
        document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__controls`).style.display = 'grid';

        document.querySelector(`li[id="${orderpositionID}"] > div.orderposition__edit`).style.display = 'none';
    };

    onDeleteOrderposition = ({ orderpositionID, orderlistID }) => {
        const orderlist = this.#orderlists.find(
            orderlist => orderlist.orderlistID === orderlistID
        );
        if(!orderlist) {
            console.error(`Отсутствует заказ с ID = ${orderlistID}`);
            return;
        }

        const orderposition = orderlist.getOrderposition({ orderpositionID });
        if(!orderposition) {
            console.error(`В заказе с ID = ${orderlistID} отсутствует позиция с ID = ${orderpositionID}`);
            return;
        }

        const orderpositionIsDeleted = confirm(`Позиция будет удалена. Продолжить?`);
        if(!orderpositionIsDeleted) return;

        try {
            var req = new XMLHttpRequest();
            req.open("DELETE", OM_APP_API + "/orderpositions/" + orderpositionID, false);
            req.send();
    
            if(req.status != 200)
            {
                throw("Не удалось удалить позицию. Ошибка: " + req.status);
            }

            orderlist.deleteOrderposition({ orderpositionID });
            document.querySelector(`li[id="${orderpositionID}"]`).remove();
            
        } catch (error) {
            alert(error);
        }
    };

    onMoveOrderposition = ({ orderpositionID, orderlistID, direction }) => {
        if(direction !== OrderpositionBtnTypes.MOVE_ORDERPOSITION_BACK && direction !== OrderpositionBtnTypes.MOVE_ORDERPOSITION_FORWARD) return;

        const srcOrderlistIndex = this.#orderlists.findIndex(
            orderlist => orderlist.orderlistID === orderlistID
        );
        if(srcOrderlistIndex === -1) {
            console.error(`Отсутствует заказ с ID = ${orderlistID}`);
            return;
        }

        const movingOrderposition = this.#orderlists[srcOrderlistIndex].getOrderposition({ orderpositionID });
        if(!movingOrderposition) {
            console.error(`В заказе с ID = ${orderlistID} отсутствует позиция с ID = ${orderpositionID}`);
            return;
        }

        const destOrderlistIndex = direction === OrderpositionBtnTypes.MOVE_ORDERPOSITION_BACK
            ? srcOrderlistIndex - 1
            : srcOrderlistIndex + 1;

        if(destOrderlistIndex === -1 || destOrderlistIndex === this.#orderlists.length) return;

        const destOrderlistID = this.#orderlists[destOrderlistIndex].orderlistID;

        try {
            var req = new XMLHttpRequest();
            req.open("PATCH", OM_APP_API + "/orderlists", false);
            req.setRequestHeader("Content-Type", "application/json");
            req.send(`{
                "orderpositionID": "${orderpositionID}",
                "destOrderlistID": "${destOrderlistID}"
            }`);
    
            if(req.status != 200)
            {
                throw("Не удалось переместить позицию. Ошибка: " + req.status);
            }

            this.#orderlists[srcOrderlistIndex].deleteOrderposition({ orderpositionID });
            movingOrderposition.orderlistID = this.#orderlists[destOrderlistIndex].orderlistID;
            this.#orderlists[destOrderlistIndex].addOrderposition({ orderposition: movingOrderposition });

            const movingOrderpositionEl = document.querySelector(`li[id="${orderpositionID}"]`);
            document.querySelector(`li[id="${movingOrderposition.orderlistID}"] > ul.orderlist__orderpositions-list`)
                .appendChild(movingOrderpositionEl);
            
        } catch (error) {
            alert(error);
        }
    };

    nextDay = () => {
        try {
            var req = new XMLHttpRequest();
            req.open("PATCH", OM_APP_API + "/appdate", false);
            req.send();
    
            if(req.status != 200)
            {
                throw("Не удалось перейти в будущее. Ошибка: " + req.status);
            }

            this.#orderlists.forEach(function(orderlist, index, array) {
                document.querySelector(`li[id="${orderlist.orderlistID}"]`).remove();
            })
    
            this.#orderlists = [];
    
            this.init();
            
        } catch (error) {
            alert(error);
        }
    };

    onKeydownEscape = (event) => {
        if(event.key !== 'Escape') return;
        const inputClient =  document.getElementById('add-orderlist-input-client');
        inputClient.style.display = 'none';
        inputClient.value = '';

        if(event.key !== 'Escape') return;
        const inputDate =  document.getElementById('add-orderlist-input-date');
        inputDate.style.display = 'none';
        inputDate.value = this.#currentDate;

        document.getElementById('add-orderlist-btn').style.display = 'initial';
    };

    onKeydownEnter = (event) => {
        if(event.key !== 'Enter') return;

        const inputClient =  document.getElementById('add-orderlist-input-client');
        const inputDate =  document.getElementById('add-orderlist-input-date');

        if(inputClient.value !== '' && inputDate.value >= this.#currentDate) {
            
            try {
                var req = new XMLHttpRequest();
                req.open("POST", OM_APP_API + "/orderlists", false);
                req.setRequestHeader("Content-Type", "application/json");
                req.send(`{
                    "orderlistClient": "${inputClient.value}",
                    "orderlistDate": "${inputDate.value}"
                }`);
        
                if(req.status != 200)
                {
                    throw("Не удалось создать заказ. Ошибка: " + req.status);
                }

                const reqJSON = JSON.parse(req.responseText);


                const newOrderlist = new Orderlist({
                    orderlistID: reqJSON.orderlistID,
                    orderlistClient: inputClient.value,
                    orderlistDate: inputDate.value,
                    items: this.#items,
                    defaultItemName: this.#defaultItemName,
                    onEditOrder: this.onEditOrder,
                    onDeleteOrder: this.onDeleteOrder,
                    onEditOrderApply: this.onEditOrderApply,
                    onEditOrderCancel: this.onEditOrderCancel,
                    onEditOrderposition: this.onEditOrderposition,
                    onEditOrderpositionApply: this.onEditOrderpositionApply,
                    onEditOrderpositionCancel: this.onEditOrderpositionCancel,
                    onDeleteOrderposition: this.onDeleteOrderposition,
                    onMoveOrderposition: this.onMoveOrderposition
                });
    
                this.#orderlists.push(newOrderlist);
                newOrderlist.render();
    
                inputClient.value = '';
                inputDate.value = this.#currentDate;

            } catch (error) {
                alert(error);
            }
        }
        else {
            inputClient.style.display = 'none';
            inputDate.style.display = 'none';
    
            document.getElementById('add-orderlist-btn').style.display = 'initial';
        }
    };

    init() {
        document.getElementById('add-orderlist-btn')
            .addEventListener('click', (event) => {
                event.target.style.display = 'none';

                const inputClient = document.getElementById('add-orderlist-input-client');
                inputClient.style.display = 'initial';
                const inputDate = document.getElementById('add-orderlist-input-date');
                inputDate.style.display = 'initial';
                inputClient.focus();
            });

        document.addEventListener('keydown', this.onKeydownEscape);
        document.addEventListener('keydown', this.onKeydownEnter);

        document.querySelector(`button[id="next-day-button"]`).addEventListener('click', this.nextDay);

        try {
            // Date
            {
                var req = new XMLHttpRequest();
                req.open("GET", OM_APP_API + "/appdate", false);
                req.send(null);
    
                if(req.status != 200)
                {
                    throw("could not get app date from server");
                }
    
                const reqJSON = JSON.parse(req.responseText);
                
                this.#currentDate = parseDate(reqJSON.appDate);
    
                document.getElementById("add-orderlist-input-date").setAttribute("value", this.#currentDate);
                document.getElementById("add-orderlist-input-date").setAttribute("min", this.#currentDate);
            }
            
            // Item list
            {
                var req = new XMLHttpRequest();
                req.open("GET", OM_APP_API + "/items", false);
                req.send(null);
    
                if(req.status != 200)
                {
                    throw("could not get items from server");
                }
    
                const reqJSON = JSON.parse(req.responseText);

                const itemArray = reqJSON.items;

                this.#items = [];
                itemArray.forEach(item => {
                    this.#items.push(item.itemName);
                });

                this.#defaultItemName = this.#items.at(0);
            }

            // Orderlists
            {
                var req = new XMLHttpRequest();
                req.open("GET", OM_APP_API + "/orderlists", false);
                req.send(null);
    
                if(req.status != 200)
                {
                    throw("could not get orderlists from server");
                }
    
                const reqJSON = JSON.parse(req.responseText);

                const orderArray = reqJSON.orderlists;

                orderArray.forEach( orderlist => {
                    const newOrderlist = new Orderlist({
                        orderlistID: orderlist.orderlistID,
                        orderlistClient: orderlist.orderlistClient,
                        orderlistDate: parseDate(orderlist.orderlistDate),
                        items: this.#items,
                        defaultItemName: this.#defaultItemName,
                        onEditOrder: this.onEditOrder,
                        onDeleteOrder: this.onDeleteOrder,
                        onEditOrderApply: this.onEditOrderApply,
                        onEditOrderCancel: this.onEditOrderCancel,
                        onEditOrderposition: this.onEditOrderposition,
                        onEditOrderpositionApply: this.onEditOrderpositionApply,
                        onEditOrderpositionCancel: this.onEditOrderpositionCancel,
                        onDeleteOrderposition: this.onDeleteOrderposition,
                        onMoveOrderposition: this.onMoveOrderposition
                    });
        
                    this.#orderlists.push(newOrderlist);
                    newOrderlist.render();

                    orderlist.orderpositions.forEach( position => {
                        const newOrderposition = new Orderposition({
                            orderpositionID: position.orderpositionID,
                            orderpositionItemName: position.orderpositionItem,
                            orderpositionAmount: position.orderpositionAmount,
                            orderlistID: position.orderlistID,
                            items: this.#items,
                            onEditOrderposition: this.onEditOrderposition,
                            onEditOrderpositionApply: this.onEditOrderpositionApply,
                            onEditOrderpositionCancel: this.onEditOrderpositionCancel,
                            onDeleteOrderposition: this.onDeleteOrderposition,
                            onMoveOrderposition: this.onMoveOrderposition
                        });                
                        newOrderlist.addOrderposition({ orderposition: newOrderposition });
                        newOrderposition.render();
                    });
                });
            }

        } catch (error) {
            alert("Error connecting to server: " + error);
            document.getElementById("om-app-base").style.display = 'none';
        }
    }
}

const OrderlistEditBtnTypes = Object.freeze({
    EDIT_ORDER_CANCEL: 'EDIT_ORDER_CANCEL',
    EDIT_ORDER_APPLY: 'EDIT_ORDER_APPLY',
});

const OrderlistEditBtnParams = Object.freeze([
    Object.freeze({
        type: OrderlistEditBtnTypes.EDIT_ORDER_APPLY,
        className: 'orderlist-edit-apply',
        value: 'Принять'
    }),
    Object.freeze({
        type: OrderlistEditBtnTypes.EDIT_ORDER_CANCEL,
        className: 'orderlist-edit-cancel',
        value: 'Отмена'
    })
]);

const OrderpositionEditBtnTypes = Object.freeze({
    EDIT_ORDERPOSITION_CANCEL: 'EDIT_ORDERPOSITION_CANCEL',
    EDIT_ORDERPOSITION_APPLY: 'EDIT_ORDERPOSITION_APPLY',
});

const OrderpositionEditBtnParams = Object.freeze([
    Object.freeze({
        type: OrderpositionEditBtnTypes.EDIT_ORDERPOSITION_APPLY,
        className: 'orderposition-edit-apply',
        value: 'Принять'
    }),
    Object.freeze({
        type: OrderpositionEditBtnTypes.EDIT_ORDERPOSITION_CANCEL,
        className: 'orderposition-edit-cancel',
        value: 'Отмена'
    })
]);

const OrderlistBtnTypes = Object.freeze({
    EDIT_ORDER: 'EDIT_ORDER',
    DELETE_ORDER: 'DELETE_ORDER',
});

const OrderlistBtnParams = Object.freeze([
    Object.freeze({
        type: OrderlistBtnTypes.EDIT_ORDER,
        className: 'orderlist-edit',
        imgSrc: './assets/edit.svg',
        imgAlt: 'Edit order'
    }),
    Object.freeze({
        type: OrderlistBtnTypes.DELETE_ORDER,
        className: 'orderlist-delete',
        imgSrc: './assets/delete-button.svg',
        imgAlt: 'Delete order'
    })
]);

class Orderlist {
    #orderlistID = '';
    #orderlistClient = '';
    #orderlistDate = '';
    #orderpositions = [];

    #items = [];
    #defaultItemName = '';

    constructor({
        orderlistID,
        orderlistClient,
        orderlistDate,
        items,
        defaultItemName,
        onEditOrder,
        onDeleteOrder,
        onEditOrderApply,
        onEditOrderCancel,
        onEditOrderposition,
        onEditOrderpositionApply,
        onEditOrderpositionCancel,
        onDeleteOrderposition,
        onMoveOrderposition
    }) {
        this.#orderlistID = orderlistID;
        this.#orderlistClient = orderlistClient;
        this.#orderlistDate = orderlistDate;
        this.#items = items;
        this.#defaultItemName = defaultItemName;
        this.onEditOrder = onEditOrder;
        this.onDeleteOrder = onDeleteOrder;
        this.onEditOrderApply = onEditOrderApply;
        this.onEditOrderCancel = onEditOrderCancel;
        this.onEditOrderposition = onEditOrderposition;
        this.onEditOrderpositionApply = onEditOrderpositionApply;
        this.onEditOrderpositionCancel = onEditOrderpositionCancel;
        this.onDeleteOrderposition = onDeleteOrderposition;
        this.onMoveOrderposition = onMoveOrderposition;
    }

    get orderlistID() { return this.#orderlistID; }

    getOrderposition({ orderpositionID }) {
        return this.#orderpositions.find(orderposition => orderposition.orderpositionID === orderpositionID);
    }

    addOrderposition({ orderposition }) {
        if(!orderposition instanceof Orderposition) return ;

        this.#orderpositions.push(orderposition);
    };

    deleteOrderposition({ orderpositionID }) {
        const deletedOrderpositionIndex = this.#orderpositions.findIndex(orderposition => orderposition.orderpositionID === orderpositionID);
        if(deletedOrderpositionIndex === -1) return;

        this.#orderpositions.splice(deletedOrderpositionIndex, 1);
    }

    onAddOrderposition = (defaultItemName) => {

        try {
            var req = new XMLHttpRequest();
                req.open("POST", OM_APP_API + "/orderpositions", false);
                req.setRequestHeader("Content-Type", "application/json");
                req.send(`{
                    "orderpositionItem": "${defaultItemName}",
                    "orderpositionAmount": 0,
                    "orderlistID": "${this.#orderlistID}"
                }`);
    
            if(req.status != 200)
            {
                throw("Не удалось создать позицию. Ошибка: " + req.status);
            }
            const reqJSON = JSON.parse(req.responseText);


            const newOrderposition = new Orderposition({
                orderpositionID: reqJSON.orderpositionID,
                orderpositionItemName: defaultItemName,
                orderpositionAmount: 0,
                orderlistID: this.#orderlistID,
                items: this.#items,
                onEditOrderposition: this.onEditOrderposition,
                onEditOrderpositionApply: this.onEditOrderpositionApply,
                onEditOrderpositionCancel: this.onEditOrderpositionCancel,
                onDeleteOrderposition: this.onDeleteOrderposition,
                onMoveOrderposition: this.onMoveOrderposition
            });
    

            this.#orderpositions.push(newOrderposition);
            newOrderposition.render();
    
            newOrderposition.onEditOrderposition({orderpositionID: newOrderposition.orderpositionID, orderlistID: newOrderposition.orderlistID});
            
        } catch (error) {
            alert(error);
        }
    };

    render() {
        const orderlistEl = document.createElement('li');
        orderlistEl.classList.add('orderlist');
        orderlistEl.setAttribute('id', this.#orderlistID);

        const headerEl = document.createElement('header');
        headerEl.classList.add('orderlist__header');
        {
            const mainButtonsEl = document.createElement('div');
            mainButtonsEl.classList.add('orderlist__header__controls');

            OrderlistBtnParams.forEach(({ className, imgSrc, imgAlt, type }) => {
                const buttonEl = document.createElement('button');
                buttonEl.classList.add(className);
    
                switch(type) {
                    case OrderlistBtnTypes.EDIT_ORDER:
                        buttonEl.addEventListener('click', () => this.onEditOrder({
                            orderlistID: this.#orderlistID,
                        }));
                        break;
    
                    case OrderlistBtnTypes.DELETE_ORDER:
                        buttonEl.addEventListener('click', () => this.onDeleteOrder({
                            orderlistID: this.#orderlistID,
                        }));
                        break;
    
                    default:
                        break;
                }
    
                const imgEl = document.createElement('img');
                imgEl.setAttribute('src', imgSrc);
                imgEl.setAttribute('alt', imgAlt);
                buttonEl.appendChild(imgEl);
    
                mainButtonsEl.appendChild(buttonEl);
            });

            headerEl.appendChild(mainButtonsEl);

            const clientEl = document.createElement('div');
            clientEl.classList.add('orderlist__header__client');
            clientEl.innerHTML = `Заказчик: ${this.#orderlistClient}`;
            headerEl.appendChild(clientEl);

            const dateEl = document.createElement('div');
            dateEl.classList.add('orderlist__header__date');
            dateEl.innerHTML = `Дата: ${this.#orderlistDate}`;
            headerEl.appendChild(dateEl);
            
            const inputClientEl = document.createElement('input');
            inputClientEl.setAttribute('type', 'text');
            inputClientEl.setAttribute('placeholder', 'Заказчик');
            inputClientEl.classList.add('orderlist__header__edit-client');
            headerEl.appendChild(inputClientEl);

            const inputDateEl = document.createElement('input');
            inputDateEl.setAttribute('type', 'date');
            inputDateEl.classList.add('orderlist__header__edit-date');
            inputDateEl.setAttribute('min', document.getElementById('add-orderlist-input-date').getAttribute('min'));
            headerEl.appendChild(inputDateEl);

            const editControlsEl = document.createElement('div')
            editControlsEl.classList.add('orderlist__header__edit__controls');
            OrderlistEditBtnParams.forEach(({ className, value, type }) => {
                const buttonEl = document.createElement('button');
                buttonEl.classList.add(className);

                switch(type) {
                    case OrderlistEditBtnTypes.EDIT_ORDER_CANCEL:
                        buttonEl.addEventListener('click', () => this.onEditOrderCancel({
                            orderlistID: this.#orderlistID,
                        }));
                        break;

                    case OrderlistEditBtnTypes.EDIT_ORDER_APPLY:
                        buttonEl.addEventListener('click', () => this.onEditOrderApply({
                            orderlistID: this.#orderlistID,
                        }));
                        break;

                    default:
                        break;
                }
                buttonEl.innerHTML = value;

                editControlsEl.appendChild(buttonEl);
            });
            headerEl.appendChild(editControlsEl);
        }
        orderlistEl.appendChild(headerEl);

        const orderpositionsEl = document.createElement('ul');
        orderpositionsEl.classList.add('orderlist__orderpositions-list');
        orderlistEl.appendChild(orderpositionsEl);

        const buttonEl = document.createElement('button');
        buttonEl.classList.add('orderlist__add-orderposition-btn');
        buttonEl.innerHTML = 'Добавить позицию';
        buttonEl.addEventListener('click', () => this.onAddOrderposition(this.#defaultItemName));
        orderlistEl.appendChild(buttonEl);

        const tlListEl = document.querySelector('ul.orderlists-list');
        tlListEl.insertBefore(orderlistEl, tlListEl.children[tlListEl.children.length - 1]);
    }
}

const OrderpositionBtnTypes = Object.freeze({
    EDIT_ORDERPOSITION: 'EDIT_ORDERPOSITION',
    DELETE_ORDERPOSITION: 'DELETE_ORDERPOSITION',
    MOVE_ORDERPOSITION_BACK: 'MOVE_ORDERPOSITION_BACK',
    MOVE_ORDERPOSITION_FORWARD: 'MOVE_ORDERPOSITION_FORWARD'
});

const OrderpositionBtnParams = Object.freeze([
    Object.freeze({
        type: OrderpositionBtnTypes.MOVE_ORDERPOSITION_BACK,
        className: 'orderposition-move-back',
        imgSrc: './assets/left-arrow.svg',
        imgAlt: 'Move orderposition to previous orderlist'
    }),
    Object.freeze({
        type: OrderpositionBtnTypes.MOVE_ORDERPOSITION_FORWARD,
        className: 'orderposition-move-forward',
        imgSrc: './assets/right-arrow.svg',
        imgAlt: 'Move orderposition to next orderlist'
    }),
    Object.freeze({
        type: OrderpositionBtnTypes.EDIT_ORDERPOSITION,
        className: 'orderposition-edit',
        imgSrc: './assets/edit.svg',
        imgAlt: 'Edit orderposition'
    }),
    Object.freeze({
        type: OrderpositionBtnTypes.DELETE_ORDERPOSITION,
        className: 'orderposition-delete',
        imgSrc: './assets/delete-button.svg',
        imgAlt: 'Delete orderposition'
    })
]);

class Orderposition {
    #orderpositionID = '';
    #orderpositionItemName = '';
    #orderpositionAmount = '';
    #orderlistID = '';

    #items = [];

    constructor({
        orderpositionID,
        orderpositionItemName,
        orderpositionAmount,
        orderlistID,
        items,
        onEditOrderposition,
        onEditOrderpositionApply,
        onEditOrderpositionCancel,
        onDeleteOrderposition,
        onMoveOrderposition
    }) {
        this.#orderpositionID = orderpositionID;
        this.#orderpositionItemName = orderpositionItemName;
        this.#orderpositionAmount = orderpositionAmount;
        this.#orderlistID = orderlistID;
        this.#items = items;
        this.onEditOrderposition = onEditOrderposition;
        this.onEditOrderpositionApply = onEditOrderpositionApply;
        this.onEditOrderpositionCancel = onEditOrderpositionCancel;
        this.onDeleteOrderposition = onDeleteOrderposition;
        this.onMoveOrderposition = onMoveOrderposition;
    }

    get orderpositionID() { return this.#orderpositionID; }

    get orderpositionItemName() { return this.#orderpositionItemName; }
    set orderpositionItemName(newOrderpositionItemName) {
        if (typeof newOrderpositionItemName !== 'string') return;

        this.#orderpositionItemName = newOrderpositionItemName;
    }

    get orderpositionAmount() { return this.#orderpositionAmount; }
    set orderpositionAmount(newOrderpositionAmount) {
        if (typeof newOrderpositionAmount !== 'number') return;

        this.#orderpositionAmount = newOrderpositionAmount;
    }

    get orderlistID() { return this.#orderlistID; }
    set orderlistID(newOrderlistID) {
        if (typeof newOrderlistID !== 'string') return;

        this.#orderlistID = newOrderlistID;
    }

    render() {
        const orderpositionEl = document.createElement('li');
        orderpositionEl.classList.add('orderposition');
        orderpositionEl.setAttribute('id', this.#orderpositionID);

        const infoEl = document.createElement('div');
        infoEl.classList.add('orderposition__info');
        infoEl.innerHTML = 
                `<span class="orderposition__info__item-name">Товар: ${this.#orderpositionItemName}</span>
                <span class="orderposition__info__amount">Количество: ${this.#orderpositionAmount}</span>`;
        orderpositionEl.appendChild(infoEl);

        const controlsEl = document.createElement('div')
        controlsEl.classList.add('orderposition__controls');

        OrderpositionBtnParams.forEach(({ className, imgSrc, imgAlt, type }) => {
            const buttonEl = document.createElement('button');
            buttonEl.classList.add(className);

            switch(type) {
                case OrderpositionBtnTypes.EDIT_ORDERPOSITION:
                    buttonEl.addEventListener('click', () => this.onEditOrderposition({
                        orderlistID: this.#orderlistID,
                        orderpositionID: this.#orderpositionID
                    }));
                    break;

                case OrderpositionBtnTypes.DELETE_ORDERPOSITION:
                    buttonEl.addEventListener('click', () => this.onDeleteOrderposition({
                        orderlistID: this.#orderlistID,
                        orderpositionID: this.#orderpositionID
                    }));
                    break;

                case OrderpositionBtnTypes.MOVE_ORDERPOSITION_BACK:
                    buttonEl.addEventListener('click', () => this.onMoveOrderposition({
                        orderlistID: this.#orderlistID,
                        orderpositionID: this.#orderpositionID,
                        direction: OrderpositionBtnTypes.MOVE_ORDERPOSITION_BACK
                    }));
                    break;

                case OrderpositionBtnTypes.MOVE_ORDERPOSITION_FORWARD:
                    buttonEl.addEventListener('click', () => this.onMoveOrderposition({
                        orderlistID: this.#orderlistID,
                        orderpositionID: this.#orderpositionID,
                        direction: OrderpositionBtnTypes.MOVE_ORDERPOSITION_FORWARD
                    }));
                    break;

                default:
                    break;
            }

            const imgEl = document.createElement('img');
            imgEl.setAttribute('src', imgSrc);
            imgEl.setAttribute('alt', imgAlt);
            buttonEl.appendChild(imgEl);

            controlsEl.appendChild(buttonEl);
        });
        orderpositionEl.appendChild(controlsEl);


        const editEl = document.createElement('div');
        editEl.classList.add('orderposition__edit');
        {
            const editInputEl = document.createElement('div');
            editInputEl.classList.add('orderposition__edit__input');
            {
                const editInputItemEl = document.createElement('select');
                editInputItemEl.classList.add('orderposition__edit__input__item');
                {
                    this.#items.forEach(function(item, index, array) {
                        const optionEl = document.createElement('option');
                        optionEl.setAttribute('value', item);
                        optionEl.innerHTML = item;
                        editInputItemEl.appendChild(optionEl);
                    })
                }
                editInputEl.appendChild(editInputItemEl);

                
                const editInputAmountEl = document.createElement('input');
                editInputAmountEl.classList.add('orderposition__edit__input__amount');
                editInputAmountEl.setAttribute('type', 'number');
                editInputAmountEl.setAttribute('min', '1');
                editInputAmountEl.setAttribute('value', '1');
                editInputAmountEl.setAttribute('placeholder', 'Количество');
                editInputEl.appendChild(editInputAmountEl);
            }
            editEl.appendChild(editInputEl);


            const editControlsEl = document.createElement('div')
            editControlsEl.classList.add('orderposition__edit__controls');
            OrderpositionEditBtnParams.forEach(({ className, value, type }) => {
                const buttonEl = document.createElement('button');
                buttonEl.classList.add(className);

                switch(type) {
                    case OrderpositionEditBtnTypes.EDIT_ORDERPOSITION_CANCEL:
                        buttonEl.addEventListener('click', () => this.onEditOrderpositionCancel({
                            orderlistID: this.#orderlistID,
                            orderpositionID: this.#orderpositionID,
                        }));
                        break;

                    case OrderpositionEditBtnTypes.EDIT_ORDERPOSITION_APPLY:
                        buttonEl.addEventListener('click', () => this.onEditOrderpositionApply({
                            orderlistID: this.#orderlistID,
                            orderpositionID: this.#orderpositionID,
                        }));
                        break;

                    default:
                        break;
                }
                buttonEl.innerHTML = value;

                editControlsEl.appendChild(buttonEl);
            })
            editEl.appendChild(editControlsEl);
        }
        orderpositionEl.appendChild(editEl);


        document.querySelector(`li[id="${this.#orderlistID}"] > ul.orderlist__orderpositions-list`)
            .appendChild(orderpositionEl);
    }
}
