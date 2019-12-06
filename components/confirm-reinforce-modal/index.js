// components/confirm-reinforce-modal/index.js
import modal_print from './event'

Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },
    data: {
        show: false
    },
    lifetimes: {
        attached () {
            let target = this;
            const reFn = function () {
                return {
                    show: !this.data.show
                };
            }
            modal_print.onToData({target, reFn})
        },
        detached () {
            modal_print.moveToData()
        }
    },
    methods: {
        cancelModal () {
            modal_print.cancelModal()
        }
    }
})
