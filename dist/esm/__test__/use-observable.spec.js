import { __assign, __read } from "tslib";
import React from 'react';
import { create, act } from 'react-test-renderer';
import * as Sinon from 'sinon';
import { of, Observable, Subject } from 'rxjs';
import { find } from './find';
import { useObservable } from '../use-observable';
import { tap, withLatestFrom, map } from 'rxjs/operators';
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
            var value = useObservable(function () { return of(100); });
            return React.createElement("h1", null, value);
        }
        var fixtureNode = React.createElement(Fixture, null);
        var testRenderer = create(fixtureNode);
        expect(find(testRenderer.root, 'h1').children).toEqual([]);
        act(function () { return testRenderer.update(fixtureNode); });
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + value]);
    });
    it('should render the initialValue', function () {
        var initialValue = 2000;
        var value = 100;
        function Fixture() {
            var value = useObservable(function () { return of(100); }, initialValue);
            return React.createElement("h1", null, value);
        }
        var fixtureNode = React.createElement(Fixture, null);
        var testRenderer = create(fixtureNode);
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + initialValue]);
        act(function () { return testRenderer.update(fixtureNode); });
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + value]);
    });
    it('should call teardown logic after unmount', function () {
        var spy = Sinon.spy();
        function Fixture() {
            var value = useObservable(function () {
                return new Observable(function (observer) {
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
            return React.createElement("h1", null, value);
        }
        var fixtureNode = React.createElement(Fixture, null);
        var testRenderer = create(fixtureNode);
        expect(spy.callCount).toBe(0);
        testRenderer.unmount();
        expect(spy.callCount).toBe(1);
    });
    it('should emit changed states in observableFactory', function () {
        var spy = Sinon.spy();
        var initialValue = 1000;
        var source$ = new Subject();
        function Fixture() {
            var value = useObservable(function (state$) {
                return source$.pipe(withLatestFrom(state$), map(function (_a) {
                    var _b = __read(_a, 2), intervalValue = _b[0], state = _b[1];
                    if (state) {
                        return intervalValue + state;
                    }
                    return intervalValue;
                }), tap(spy));
            });
            return (React.createElement(React.Fragment, null,
                React.createElement("h1", null, value)));
        }
        var testRenderer = create(React.createElement(Fixture, null));
        expect(spy.callCount).toBe(0);
        expect(find(testRenderer.root, 'h1').children).toEqual([]);
        act(function () { return testRenderer.update(React.createElement(Fixture, null)); });
        source$.next(initialValue);
        expect(spy.callCount).toBe(1);
        expect(spy.args[0]).toEqual([initialValue]);
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + initialValue]);
        act(function () { return testRenderer.update(React.createElement(Fixture, null)); });
        var secondValue = 2000;
        source$.next(secondValue);
        expect(spy.callCount).toBe(2);
        expect(spy.args[1]).toEqual([initialValue + secondValue]);
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + (initialValue + secondValue)]);
    });
    it('should emit changed props in observableFactory', function () {
        var timer = Sinon.useFakeTimers();
        var spy = Sinon.spy();
        var timeToDelay = 200;
        function Fixture(props) {
            var value = useObservable(function (_, inputs$) { return inputs$.pipe(tap(spy)); }, null, [props.foo, props.baz]);
            return (React.createElement(React.Fragment, null,
                React.createElement("h1", null, value && value[0]),
                React.createElement("div", null, value && value[1].foo)));
        }
        var props = {
            foo: 1,
            bar: 'bar',
            baz: {
                foo: 1,
            },
        };
        var testRenderer = create(React.createElement(Fixture, __assign({}, props)));
        expect(spy.callCount).toBe(0);
        expect(find(testRenderer.root, 'h1').children).toEqual([]);
        expect(find(testRenderer.root, 'div').children).toEqual([]);
        var newProps = __assign(__assign({}, props), { bar: 'new bar' });
        act(function () { return testRenderer.update(React.createElement(Fixture, __assign({}, newProps))); });
        // wait useEffect fired
        // https://reactjs.org/docs/hooks-reference.html#timing-of-effects
        timer.tick(timeToDelay);
        expect(spy.callCount).toBe(1);
        expect(spy.args[0]).toEqual([[newProps.foo, newProps.baz]]);
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + newProps.foo]);
        expect(find(testRenderer.root, 'div').children).toEqual(["" + newProps.baz.foo]);
        var renewProps = __assign(__assign({}, props), { foo: 1000 });
        act(function () { return testRenderer.update(React.createElement(Fixture, __assign({}, renewProps))); });
        timer.tick(timeToDelay);
        expect(spy.callCount).toBe(2);
        expect(spy.args[1]).toEqual([[renewProps.foo, renewProps.baz]]);
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + renewProps.foo]);
        expect(find(testRenderer.root, 'div').children).toEqual(["" + renewProps.baz.foo]);
    });
});
//# sourceMappingURL=use-observable.spec.js.map