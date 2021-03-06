"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var react_test_renderer_1 = require("react-test-renderer");
var Sinon = tslib_1.__importStar(require("sinon"));
var find_1 = require("./find");
var use_event_callback_1 = require("../use-event-callback");
describe('useEventCallback specs', function () {
    function createFixture(factory, initialValue) {
        return function Fixture() {
            var _a = tslib_1.__read(use_event_callback_1.useEventCallback(factory, initialValue), 2), callback = _a[0], value = _a[1];
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("h1", null, value),
                react_1.default.createElement("button", { onClick: callback }, "click me")));
        };
    }
    it('should generate callback', function () {
        var Fixture = createFixture(function () { return rxjs_1.of(1); });
        var fixtureNode = react_1.default.createElement(Fixture, null);
        var testRenderer = react_test_renderer_1.create(fixtureNode);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        var button = find_1.find(testRenderer.root, 'button');
        expect(button.props.onClick.name).toBe('eventCallback');
    });
    it('should render value', function () {
        var value = 1;
        var Fixture = createFixture(function () { return rxjs_1.of(value); });
        var fixtureNode = react_1.default.createElement(Fixture, null);
        var testRenderer = react_test_renderer_1.create(fixtureNode);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual([]);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + value]);
    });
    it('should trigger handle async callback', function () {
        var timer = Sinon.useFakeTimers();
        var timeToDelay = 200;
        var value = 1;
        var Fixture = createFixture(function (event$) {
            return event$.pipe(operators_1.mapTo(value), operators_1.delay(timeToDelay));
        });
        var fixtureNode = react_1.default.createElement(Fixture, null);
        var testRenderer = react_test_renderer_1.create(fixtureNode);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        var button = find_1.find(testRenderer.root, 'button');
        button.props.onClick();
        timer.tick(timeToDelay);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + value]);
        timer.restore();
    });
    it('should handle the initial value', function () {
        var timer = Sinon.useFakeTimers();
        var initialValue = 1000;
        var value = 1;
        var timeToDelay = 200;
        var Fixture = createFixture(function (event$) {
            return event$.pipe(operators_1.mapTo(value), operators_1.delay(timeToDelay));
        }, initialValue);
        var fixtureNode = react_1.default.createElement(Fixture, null);
        var testRenderer = react_test_renderer_1.create(fixtureNode);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + initialValue]);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        var button = find_1.find(testRenderer.root, 'button');
        button.props.onClick();
        timer.tick(timeToDelay);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + value]);
        timer.restore();
    });
    it('should handle the state changed', function () {
        var timer = Sinon.useFakeTimers();
        var initialValue = 1000;
        var value = 1;
        var timeToDelay = 200;
        var factory = function (event$, state$) {
            return event$.pipe(operators_1.withLatestFrom(state$), operators_1.map(function (_a) {
                var _b = tslib_1.__read(_a, 2), _ = _b[0], state = _b[1];
                return state + value;
            }), operators_1.delay(timeToDelay));
        };
        function Fixture() {
            var _a = tslib_1.__read(use_event_callback_1.useEventCallback(factory, initialValue), 2), clickCallback = _a[0], stateValue = _a[1];
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("h1", null, stateValue),
                react_1.default.createElement("button", { onClick: clickCallback }, "click me")));
        }
        var fixtureNode = react_1.default.createElement(Fixture, null);
        var testRenderer = react_test_renderer_1.create(fixtureNode);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + initialValue]);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        var button = find_1.find(testRenderer.root, 'button');
        button.props.onClick();
        timer.tick(timeToDelay);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + (initialValue + value)]);
        button.props.onClick();
        timer.tick(timeToDelay);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + (initialValue + value * 2)]);
        timer.restore();
    });
    it('should handle the inputs changed', function () {
        var timer = Sinon.useFakeTimers();
        var initialValue = 1000;
        var value = 1;
        var timeToDelay = 200;
        var factory = function (event$, _state$, inputs$) {
            return event$.pipe(operators_1.combineLatest(inputs$), operators_1.map(function (_a) {
                var _b = tslib_1.__read(_a, 2), _ = _b[0], _c = tslib_1.__read(_b[1], 1), count = _c[0];
                return value + count;
            }), operators_1.delay(timeToDelay));
        };
        function Fixture(props) {
            var _a = tslib_1.__read(use_event_callback_1.useEventCallback(factory, initialValue, [props.count]), 2), clickCallback = _a[0], stateValue = _a[1];
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("h1", null, stateValue),
                react_1.default.createElement("button", { onClick: clickCallback }, "click me")));
        }
        var fixtureNode = react_1.default.createElement(Fixture, { count: 1 });
        var testRenderer = react_test_renderer_1.create(fixtureNode);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + initialValue]);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        var button = find_1.find(testRenderer.root, 'button');
        button.props.onClick();
        timer.tick(timeToDelay);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + (value + 1)]);
        react_test_renderer_1.act(function () { return testRenderer.update(react_1.default.createElement(Fixture, { count: 4 })); });
        button.props.onClick();
        timer.tick(timeToDelay);
        react_test_renderer_1.act(function () { return testRenderer.update(react_1.default.createElement(Fixture, { count: 4 })); });
        timer.tick(timeToDelay);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + (value + 4)]);
        timer.restore();
    });
    it('should call teardown logic after unmount', function () {
        var spy = Sinon.spy();
        var Fixture = createFixture(function () {
            return new rxjs_1.Observable(function (observer) {
                var timerId = setTimeout(function () {
                    observer.next(1);
                    observer.complete();
                }, 1000);
                return function () {
                    spy();
                    clearTimeout(timerId);
                };
            });
        });
        var fixtureNode = react_1.default.createElement(Fixture, null);
        var testRenderer = react_test_renderer_1.create(fixtureNode);
        testRenderer.unmount();
        expect(spy.callCount).toBe(1);
    });
});
//# sourceMappingURL=use-event-callback.spec.js.map