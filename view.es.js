"use strict";
/**
 * User: Rob Richard
 * Date: 9/25/13
 * Time: 4:32 PM
 */

var Backbone = require('backbone-base-and-form-view');
var _ = require('underscore');
var $ = require('jquery');
var templates = require('./template');

/**
 * A view to make a series of buttons in a simple wrapper
 *
 * @class ButtonGroup
 * @extends Backbone.BaseView
 *
 * @param {object} options
 * @param {object[]} options.buttons
 *      An array of objects that will each be passed to the button-view template.
 *      Additionally, each object should have a 'handler' function that will be
 *      called on when the button is clicked
 * @param {string} [options.disabledClass=dibs-disable disabled]
 * @param {string} [options.loadingClass=icon icon-xlarge icon-spinner icon-spin]
 * @param {boolean} [options.prependLoading=false]
 */
var ButtonGroup = Backbone.BaseView.extend({
    tagName: 'ul',
    className: 'controls-group list-inline',
    disabledClass: 'disabled dibs-disable',
    loadingClass : 'icon icon-xlarge fa fa-spinner fa-spin',
    initialize(options) {
        this.options = options || {};
        this.btnTpl = options.btnTmpl || templates['button-view-template'];
        this._buttons = _.chain(options.buttons).map(function (btnOptions, btn) {
            if (!btnOptions) {
                return;
            }
            if (btnOptions instanceof Function) {
                btnOptions = {
                    handler: btnOptions
                };
            }
            btnOptions = _.extend({
                key: btn,
                text: btn
            }, btnOptions);
            return [btn, btnOptions];
        }, this).compact().object().value();
    },
    events: {
        'click [data-button]': 'clickBtn'
    },
    render() {
        _.extend(this, {
            disabledClass: this.options.disabledClass || this.disabledClass,
            loadingClass: this.options.loadingClass || this.loadingClass,
            prependLoading: !_.isUndefined(this.options.prependLoading) ? this.options.prependLoading : this.prependLoading
        });
        this.$el.empty();
        _.each(this._buttons, (btnOptions, btnKey) => {
            var $btn = $("<div>").html(this.btnTpl(btnOptions)).contents();
            if (btnOptions.attributes) {
                $btn.attr(btnOptions.attributes);
            }
            $btn.find('button').attr('data-button', btn);
            this.$el.append($btn);
        });
        return this;
    },
    /**
     * @protected
     * @param {$.Event} e
     */
    clickBtn(e) {
        var $btn = $(e.currentTarget);
        var btnOptions = this._buttons[$btn.attr('data-button')];
        var context = btnOptions.context || this.defaultContext || this;
        var prom;
        var appendLoaderFunc = this.prependLoading ? 'prepend' : 'append';
        var $loading;
        var self = this;

        // Prevent the page from refreshing (we allow propagation however)
        e.preventDefault();

        if ($btn.hasClass('disabled') || $btn.hasClass(this.disabledClass)) {
            return;
        }
        if (btnOptions.handler) {
            prom = btnOptions.handler.call(context, e);
        }
        // Test to see if the handler returns a promise (the same way jQuery does it).
        if (prom && _.isFunction(prom.promise)) {
            $loading = $('<li data-loading class="' + self.loadingClass + '"></li>').css('padding', 0);
            self.$el[appendLoaderFunc]($loading);
            self.disableButtons($btn);
        }

        $.when(prom).always(function () {
            self.removeLoadingEl();
            self.reEnableButtons($btn);
            self.trigger('buttonClick', btnOptions, _.result(prom, 'state'));
        });
    },

    removeLoadingEl() {
        this.$('[data-loading]').remove();
    },

    reEnableButtons: function () {
        this.$('[data-button]').removeClass('disabled ' + this.disabledClass);
    },

    /**
     * Adds the disabledClass to each of the buttons
     */
    disableButtons () {
        var disabledClass = this.disabledClass;
        this.$('[data-button]').each(function (i, btn) {
            var $btn = $(btn);
            if ($btn.hasClass('disabled') || $btn.hasClass(disabledClass)) {
                return;
            }
            $btn.addClass('disabled disabled-by-btnView ' + disabledClass);
        });
    }
});

module.exports = ButtonGroup;
