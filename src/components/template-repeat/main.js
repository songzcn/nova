"use strict";

NovaExports.exports = { "stylesheet": "<style>\n        :host {display:none;}\n    </style>", "template": "<template>\n    </template>" };
"use strict";
var TemplateRepeat = NovaExports({
    is: "template-repeat",
    "extends": "template",
    props: {
        items: {
            type: Array,
            value: function value() {
                return [];
            }
        },
        as: {
            type: Array,
            value: "item"
        },
        indexAs: {
            type: String,
            value: "index"
        },
        parentSelector: String
    },
    createdHandler: function createdHandler() {
        var self = this;

        this.insertParent = this.parentSelector ? this.parentElement.querySelector(this.parentSelector) : this.parentElement;

        // NOTICE: 通过setTimeout，保证使用js通过wrap创建元素后，能获取内部的template-repeat
        setTimeout(function () {
            self.parentElement && self.parentElement.removeChild(self);
        }, 0);

        this.on("_itemsChanged", this._itemsObserver);
        this.notifyPath("items");
    },
    _itemsObserver: function _itemsObserver(ev, oldVal, newVal, path) {
        if (path != "items" || !newVal) {
            return;
        }

        this.itemNodes = this.itemNodes || [];

        // 删除所有项
        for (var i = this.itemNodes.length - 1; i >= 0; i--) {
            this.removeItem(i);
        }
        // 添加新项
        for (var i = 0, len = newVal.length; i < len; i++) {
            this.appendItem(i);
        }
    },
    appendItem: function appendItem(index) {
        var self = this;

        var item = new TemplateRepeatItem({
            attrs: {
                index: index,
                item: "{{items." + index + "}}",
                as: this.as,
                "index-as": this.indexAs
            },
            props: {
                item: self.items[index],
                template: this.innerHTML,
                insertParent: this.insertParent
            },
            beforeCreated: function beforeCreated() {
                self.compileNode(this);
            }
        });

        item.on("_itemChanged", function (ev, oldVal, newVal, path) {
            self.itemChangedHandler.call(self, ev, oldVal, newVal, path, index);
        });

        this.itemNodes.push(item);
    },
    removeItem: function removeItem(index) {
        var self = this;
        var item = this.itemNodes.splice(index, 1)[0];
        item._childNodes.forEach(function (node) {
            node.parentElement && node.parentElement.removeChild(node);
            self.unbindNode(item);
        });
    },
    itemChangedHandler: function itemChangedHandler(ev, oldVal, newVal, path, index) {
        this.trigger("itemChanged", oldVal, newVal, path, index);
    }
});