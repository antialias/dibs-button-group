/**
 * User: Rob Richard
 * Date: 11/15/13
 * Time: 2:08 PM
 */

"use strict";

var ButtonView = require('./view');
var $ = require('jquery');
describe('ButtonView', function () {
    var btn, btnConfig, setUpView, setUpViewDeferred, deferred;
    beforeEach(function () {
        btnConfig = {
            buttons: {
                save: {
                    className: 'btn-primary',
                    handler: function () {}
                }
            }
        };
        setUpView = function () {
            btn = new ButtonView(btnConfig);
            btn.render();
        };
        setUpViewDeferred = function () {
            deferred = new $.Deferred();
            btnConfig.buttons.save.handler = jasmine.createSpy().and.callFake(function () {
                return deferred;
            });
            setUpView();
        };
    });
    it('should be defined', function () {
        expect(ButtonView).toBeDefined();
    });
    it('should call handler when the button is clicked', function () {
        btnConfig.buttons.save.handler = jasmine.createSpy();
        setUpView();
        btn.$('.btn-primary').trigger('click');
        expect(btn.options.buttons.save.handler).toHaveBeenCalled();
    });
    it('should append a spinner when handler returns a deferred and remove it when it resolves', function () {
        setUpViewDeferred();
        btn.$('.btn-primary').trigger('click');
        expect(btn.$('li:last-child').is('.fa-spinner')).toBeTruthy();
        deferred.resolve();
        expect(btn.$el.find('.fa-spinner').size()).toBeFalsy();
    });
    it('should add the disabled class when handler returns a deferred', function () {
        var deferred = new $.Deferred();
        btnConfig.buttons.save.handler = jasmine.createSpy().and.callFake(function () {
            return deferred;
        });
        setUpView();
        btn.$('.btn-primary').trigger('click');
        expect(btn.$el.find('.disabled').size()).toBeGreaterThan(0);
        deferred.resolve();
        expect(btn.$el.find('.disabled').size()).toEqual(0);
    });
    it('should add classNames passed in to the className option', function () {
        btnConfig.buttons.save.className = 'my-class';
        setUpView();
        expect(btn.$el.find('.my-class').size()).toBeGreaterThan(0);
    });
    it('should use the passed in context in the handler', function () {
        var context;
        btnConfig.buttons.save.context = {foo: 'bar'};
        btnConfig.buttons.save.handler = jasmine.createSpy().and.callFake(function () {
            context = this;
        });
        setUpView();
        btn.$('.btn-primary').trigger('click');
        expect(context.foo).toBe('bar');
    });
    it('should call appropriate handler when multiple buttons', function () {
        var saveHandler = jasmine.createSpy(),
            cancelHandler = jasmine.createSpy();
        btnConfig = {
            buttons: {
                save: {
                    className: 'save',
                    handler: saveHandler
                },
                cancel: {
                    className: 'cancel',
                    handler: cancelHandler
                }
            }
        };
        setUpView();
        expect(saveHandler).not.toHaveBeenCalled();
        expect(cancelHandler).not.toHaveBeenCalled();
        btn.$('.save').trigger('click');
        expect(saveHandler).toHaveBeenCalled();
        expect(cancelHandler).not.toHaveBeenCalled();
        btn.$('.cancel').trigger('click');
        expect(cancelHandler).toHaveBeenCalled();
    });
    it('should prepend the loader if passed prependLoading', function () {
        btnConfig.prependLoading = true;

        setUpViewDeferred();
        btn.$('.btn-primary').trigger('click');
        expect(btn.$('li:first-child').is('.fa-spinner')).toBeTruthy();
        deferred.resolve();

    });
    it('should default the button name to the key in the button map', function () {
        btnConfig = {
            buttons: {
                save: {}
            }
        };
        setUpView();
        expect(btn.$('[data-button=save]').html()).toEqual('save');
    });
    it('should use the handler as the default value in the button map', function () {
        var handlerSpy = jasmine.createSpy('save handler');
        btnConfig = {
            buttons: {
                save: handlerSpy
            }
        };
        setUpView();
        btn.$('[data-button=save]').click();
        expect(handlerSpy).toHaveBeenCalled();
    });
    it('should not have a data-tn attribute by default', function () {
        setUpView();
        expect(btn.$('.btn-primary').is('[data-tn]')).toBeFalsy();
    });
    it('should have a data-tn attribute if dataTn is provided', function () {
        btnConfig.buttons.save.dataTn = 'test-tag';
        setUpView();
        expect(btn.$('.btn-primary').is('[data-tn=test-tag]')).toBeTruthy();
    });
});
