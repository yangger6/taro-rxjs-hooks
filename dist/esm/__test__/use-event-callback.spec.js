import { __read } from "tslib";
import React from 'react';
import { Observable, of } from 'rxjs';
import { mapTo, delay, withLatestFrom, combineLatest, map } from 'rxjs/operators';
import { create, act } from 'react-test-renderer';
import * as Sinon from 'sinon';
import { find } from './find';
import { useEventCallback } from '../use-event-callback';
describe('useEventCallback specs', function () {
    function createFixture(factory, initialValue) {
        return function Fixture() {
            var _a = __read(useEventCallback(factory, initialValue), 2), callback = _a[0], value = _a[1];
            return (React.createElement(React.Fragment, null,
                React.createElement("h1", null, value),
                React.createElement("button", { onClick: callback }, "click me")));
        };
    }
    it('should generate callback', function () {
        var Fixture = createFixture(function () { return of(1); });
        var fixtureNode = React.createElement(Fixture, null);
        var testRenderer = create(fixtureNode);
        act(function () { return testRenderer.update(fixtureNode); });
        var button = find(testRenderer.root, 'button');
        expect(button.props.onClick.name).toBe('eventCallback');
    });
    it('should render value', function () {
        var value = 1;
        var Fixture = createFixture(function () { return of(value); });
        var fixtureNode = React.createElement(Fixture, null);
        var testRenderer = create(fixtureNode);
        expect(find(testRenderer.root, 'h1').children).toEqual([]);
        act(function () { return testRenderer.update(fixtureNode); });
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + value]);
    });
    it('should trigger handle async callback', function () {
        var timer = Sinon.useFakeTimers();
        var timeToDelay = 200;
        var value = 1;
        var Fixture = createFixture(function (event$) {
            return event$.pipe(mapTo(value), delay(timeToDelay));
        });
        var fixtureNode = React.createElement(Fixture, null);
        var testRenderer = create(fixtureNode);
        act(function () { return testRenderer.update(fixtureNode); });
        var button = find(testRenderer.root, 'button');
        button.props.onClick();
        timer.tick(timeToDelay);
        act(function () { return testRenderer.update(fixtureNode); });
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + value]);
        timer.restore();
    });
    it('should handle the initial value', function () {
        var timer = Sinon.useFakeTimers();
        var initialValue = 1000;
        var value = 1;
        var timeToDelay = 200;
        var Fixture = createFixture(function (event$) {
            return event$.pipe(mapTo(value), delay(timeToDelay));
        }, initialValue);
        var fixtureNode = React.createElement(Fixture, null);
        var testRenderer = create(fixtureNode);
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + initialValue]);
        act(function () { return testRenderer.update(fixtureNode); });
        var button = find(testRenderer.root, 'button');
        button.props.onClick();
        timer.tick(timeToDelay);
        act(function () { return testRenderer.update(fixtureNode); });
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + value]);
        timer.restore();
    });
    it('should handle the state changed', function () {
        var timer = Sinon.useFakeTimers();
        var initialValue = 1000;
        var value = 1;
        var timeToDelay = 200;
        var factory = function (event$, state$) {
            return event$.pipe(withLatestFrom(state$), map(function (_a) {
                var _b = __read(_a, 2), _ = _b[0], state = _b[1];
                return state + value;
            }), delay(timeToDelay));
        };
        function Fixture() {
            var _a = __read(useEventCallback(factory, initialValue), 2), clickCallback = _a[0], stateValue = _a[1];
            return (React.createElement(React.Fragment, null,
                React.createElement("h1", null, stateValue),
                React.createElement("button", { onClick: clickCallback }, "click me")));
        }
        var fixtureNode = React.createElement(Fixture, null);
        var testRenderer = create(fixtureNode);
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + initialValue]);
        act(function () { return testRenderer.update(fixtureNode); });
        var button = find(testRenderer.root, 'button');
        button.props.onClick();
        timer.tick(timeToDelay);
        act(function () { return testRenderer.update(fixtureNode); });
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + (initialValue + value)]);
        button.props.onClick();
        timer.tick(timeToDelay);
        act(function () { return testRenderer.update(fixtureNode); });
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + (initialValue + value * 2)]);
        timer.restore();
    });
    it('should handle the inputs changed', function () {
        var timer = Sinon.useFakeTimers();
        var initialValue = 1000;
        var value = 1;
        var timeToDelay = 200;
        var factory = function (event$, _state$, inputs$) {
            return event$.pipe(combineLatest(inputs$), map(function (_a) {
                var _b = __read(_a, 2), _ = _b[0], _c = __read(_b[1], 1), count = _c[0];
                return value + count;
            }), delay(timeToDelay));
        };
        function Fixture(props) {
            var _a = __read(useEventCallback(factory, initialValue, [props.count]), 2), clickCallback = _a[0], stateValue = _a[1];
            return (React.createElement(React.Fragment, null,
                React.createElement("h1", null, stateValue),
                React.createElement("button", { onClick: clickCallback }, "click me")));
        }
        var fixtureNode = React.createElement(Fixture, { count: 1 });
        var testRenderer = create(fixtureNode);
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + initialValue]);
        act(function () { return testRenderer.update(fixtureNode); });
        var button = find(testRenderer.root, 'button');
        button.props.onClick();
        timer.tick(timeToDelay);
        act(function () { return testRenderer.update(fixtureNode); });
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + (value + 1)]);
        act(function () { return testRenderer.update(React.createElement(Fixture, { count: 4 })); });
        button.props.onClick();
        timer.tick(timeToDelay);
        act(function () { return testRenderer.update(React.createElement(Fixture, { count: 4 })); });
        timer.tick(timeToDelay);
        expect(find(testRenderer.root, 'h1').children).toEqual(["" + (value + 4)]);
        timer.restore();
    });
    it('should call teardown logic after unmount', function () {
        var spy = Sinon.spy();
        var Fixture = createFixture(function () {
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
        var fixtureNode = React.createElement(Fixture, null);
        var testRenderer = create(fixtureNode);
        testRenderer.unmount();
        expect(spy.callCount).toBe(1);
    });
});
//# sourceMappingURL=use-event-callback.spec.js.map