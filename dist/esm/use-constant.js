import { useRef } from 'react';
export default function useConstant(fn) {
    var ref = useRef();
    if (!ref.current) {
        ref.current = {
            v: fn()
        };
    }
    return ref.current.v;
}
//# sourceMappingURL=use-constant.js.map