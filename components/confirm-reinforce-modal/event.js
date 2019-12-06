const Event = function () {
    this.dataStack = [];
    this.onToData = function ({target,reFn}) {
        this.dataStack.push([target,reFn])
    }

    this.moveToData = function () {
        this.dataStack.pop();
    }
    
    this.showModal = function () {
        const [[targetPage,reFn]] = this.dataStack;
        const refreshData = reFn.apply(targetPage);
        targetPage.setData(refreshData);
        return this;
    }

    this.cancelModal = function () {
        const [[targetPage,reFn]] = this.dataStack;
        const refreshData = reFn.apply(targetPage);
        targetPage.setData(refreshData);
        return this;
    }
}

export default (function(Event) { 
    let event = null;
    if (!event) {
        event = new Event()
    };
    return event;

})(Event)