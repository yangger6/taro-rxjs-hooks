"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var react_1 = tslib_1.__importDefault(require("react"));
var react_test_renderer_1 = require("react-test-renderer");
var Sinon = tslib_1.__importStar(require("sinon"));
var rxjs_1 = require("rxjs");
var find_1 = require("./find");
var use_observable_1 = require("../use-observable");
var operators_1 = require("rxjs/operators");
describe('useObservable specs', function () {
    var fakeTimer;
    beforeEach(function () {
        fakeTimer = Sinon.useFakeTimers();
    });
    afterEach(function () {
        fakeTimer.restore();
    });
    it('should get value from sync Observable', function () {
        var value = 100;
        function Fixture() {
            var value = use_observable_1.useObservable(function () { return rxjs_1.of(100); });
            return react_1.default.createElement("h1", null, value);
        }
        var fixtureNode = react_1.default.createElement(Fixture, null);
        var testRenderer = react_test_renderer_1.create(fixtureNode);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual([]);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + value]);
    });
    it('should render the initialValue', function () {
        var initialValue = 2000;
        var value = 100;
        function Fixture() {
            var value = use_observable_1.useObservable(function () { return rxjs_1.of(100); }, initialValue);
            return react_1.default.createElement("h1", null, value);
        }
        var fixtureNode = react_1.default.createElement(Fixture, null);
        var testRenderer = react_test_renderer_1.create(fixtureNode);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + initialValue]);
        react_test_renderer_1.act(function () { return testRenderer.update(fixtureNode); });
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + value]);
    });
    it('should call teardown logic after unmount', function () {
        var spy = Sinon.spy();
        function Fixture() {
            var value = use_observable_1.useObservable(function () {
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
            return react_1.default.createElement("h1", null, value);
        }
        var fixtureNode = react_1.default.createElement(Fixture, null);
        var testRenderer = react_test_renderer_1.create(fixtureNode);
        expect(spy.callCount).toBe(0);
        testRenderer.unmount();
        expect(spy.callCount).toBe(1);
    });
    it('should emit changed states in observableFactory', function () {
        var spy = Sinon.spy();
        var initialValue = 1000;
        var source$ = new rxjs_1.Subject();
        function Fixture() {
            var value = use_observable_1.useObservable(function (state$) {
                return source$.pipe(operators_1.withLatestFrom(state$), operators_1.map(function (_a) {
                    var _b = tslib_1.__read(_a, 2), intervalValue = _b[0], state = _b[1];
                    if (state) {
                        return intervalValue + state;
                    }
                    return intervalValue;
                }), operators_1.tap(spy));
            });
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("h1", null, value)));
        }
        var testRenderer = react_test_renderer_1.create(react_1.default.createElement(Fixture, null));
        expect(spy.callCount).toBe(0);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual([]);
        react_test_renderer_1.act(function () { return testRenderer.update(react_1.default.createElement(Fixture, null)); });
        source$.next(initialValue);
        expect(spy.callCount).toBe(1);
        expect(spy.args[0]).toEqual([initialValue]);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + initialValue]);
        react_test_renderer_1.act(function () { return testRenderer.update(react_1.default.createElement(Fixture, null)); });
        var secondValue = 2000;
        source$.next(secondValue);
        expect(spy.callCount).toBe(2);
        expect(spy.args[1]).toEqual([initialValue + secondValue]);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + (initialValue + secondValue)]);
    });
    it('should emit changed props in observableFactory', function () {
        var timer = Sinon.useFakeTimers();
        var spy = Sinon.spy();
        var timeToDelay = 200;
        function Fixture(props) {
            var value = use_observable_1.useObservable(function (_, inputs$) { return inputs$.pipe(operators_1.tap(spy)); }, null, [props.foo, props.baz]);
            return (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement("h1", null, value && value[0]),
                react_1.default.createElement("div", null, value && value[1].foo)));
        }
        var props = {
            foo: 1,
            bar: 'bar',
            baz: {
                foo: 1,
            },
        };
        var testRenderer = react_test_renderer_1.create(react_1.default.createElement(Fixture, tslib_1.__assign({}, props)));
        expect(spy.callCount).toBe(0);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual([]);
        expect(find_1.find(testRenderer.root, 'div').children).toEqual([]);
        var newProps = tslib_1.__assign(tslib_1.__assign({}, props), { bar: 'new bar' });
        react_test_renderer_1.act(function () { return testRenderer.update(react_1.default.createElement(Fixture, tslib_1.__assign({}, newProps))); });
        // wait useEffect fired
        // https://reactjs.org/docs/hooks-reference.html#timing-of-effects
        timer.tick(timeToDelay);
        expect(spy.callCount).toBe(1);
        expect(spy.args[0]).toEqual([[newProps.foo, newProps.baz]]);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + newProps.foo]);
        expect(find_1.find(testRenderer.root, 'div').children).toEqual(["" + newProps.baz.foo]);
        var renewProps = tslib_1.__assign(tslib_1.__assign({}, props), { foo: 1000 });
        react_test_renderer_1.act(function () { return testRenderer.update(react_1.default.createElement(Fixture, tslib_1.__assign({}, renewProps))); });
        timer.tick(timeToDelay);
        expect(spy.callCount).toBe(2);
        expect(spy.args[1]).toEqual([[renewProps.foo, renewProps.baz]]);
        expect(find_1.find(testRenderer.root, 'h1').children).toEqual(["" + renewProps.foo]);
        expect(find_1.find(testRenderer.root, 'div').children).toEqual(["" + renewProps.baz.foo]);
    });
});
//# sourceMappingURL=use-observable.spec.js.map