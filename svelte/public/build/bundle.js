
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            $$.fragment && $$.fragment.p($$.ctx, $$.dirty);
            $$.dirty = [-1];
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/ToDo.svelte generated by Svelte v3.16.4 */

    const file = "src/ToDo.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[17] = i;
    	return child_ctx;
    }

    // (59:5) {:else}
    function create_else_block_2(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			add_location(input, file, 59, 6, 1597);
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[9]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*task*/ ctx[0]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*task*/ 1 && input.value !== /*task*/ ctx[0]) {
    				set_input_value(input, /*task*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(59:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (57:5) {#if !todo.editable}
    function create_if_block_2(ctx) {
    	let span;
    	let t_value = /*todo*/ ctx[15].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 57, 6, 1551);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*todos*/ 16 && t_value !== (t_value = /*todo*/ ctx[15].name + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(57:5) {#if !todo.editable}",
    		ctx
    	});

    	return block;
    }

    // (66:5) {:else}
    function create_else_block_1(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			add_location(input, file, 66, 6, 1786);
    			dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[10]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*description*/ ctx[1]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*description*/ 2 && input.value !== /*description*/ ctx[1]) {
    				set_input_value(input, /*description*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(66:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (64:5) {#if !todo.editable}
    function create_if_block_1(ctx) {
    	let span;
    	let t_value = /*todo*/ ctx[15].description + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file, 64, 6, 1733);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*todos*/ 16 && t_value !== (t_value = /*todo*/ ctx[15].description + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(64:5) {#if !todo.editable}",
    		ctx
    	});

    	return block;
    }

    // (73:5) {:else}
    function create_else_block(ctx) {
    	let div;
    	let a0;
    	let svg0;
    	let path0;
    	let path1;
    	let t;
    	let a1;
    	let svg1;
    	let path2;
    	let path3;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[11](/*todo*/ ctx[15], ...args);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			a0 = element("a");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			t = space();
    			a1 = element("a");
    			svg1 = svg_element("svg");
    			path2 = svg_element("path");
    			path3 = svg_element("path");
    			attr_dev(path0, "d", "M0 0h24v24H0z");
    			attr_dev(path0, "fill", "none");
    			add_location(path0, file, 75, 91, 2258);
    			attr_dev(path1, "fill", "green");
    			attr_dev(path1, "d", "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z");
    			add_location(path1, file, 75, 128, 2295);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "width", "24");
    			attr_dev(svg0, "height", "24");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			add_location(svg0, file, 75, 8, 2175);
    			attr_dev(a0, "href", "#edit");
    			attr_dev(a0, "class", "tasks__save svelte-ffdv5s");
    			attr_dev(a0, "title", "save");
    			add_location(a0, file, 74, 7, 2080);
    			attr_dev(path2, "fill", "red");
    			attr_dev(path2, "d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    			add_location(path2, file, 78, 91, 2597);
    			attr_dev(path3, "d", "M0 0h24v24H0z");
    			attr_dev(path3, "fill", "none");
    			add_location(path3, file, 78, 215, 2721);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "width", "24");
    			attr_dev(svg1, "height", "24");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			add_location(svg1, file, 78, 8, 2514);
    			attr_dev(a1, "href", "#cancel");
    			attr_dev(a1, "class", "tasks__cancel");
    			attr_dev(a1, "title", "cancel");
    			add_location(a1, file, 77, 7, 2395);
    			attr_dev(div, "class", "group");
    			add_location(div, file, 73, 6, 2053);

    			dispose = [
    				listen_dev(a0, "click", prevent_default(/*editTask*/ ctx[7]), false, true, false),
    				listen_dev(
    					a1,
    					"click",
    					prevent_default(function () {
    						click_handler.apply(this, arguments);
    					}),
    					false,
    					true,
    					false
    				)
    			];
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a0);
    			append_dev(a0, svg0);
    			append_dev(svg0, path0);
    			append_dev(svg0, path1);
    			append_dev(div, t);
    			append_dev(div, a1);
    			append_dev(a1, svg1);
    			append_dev(svg1, path2);
    			append_dev(svg1, path3);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(73:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (71:5) {#if !todo.editable}
    function create_if_block(ctx) {
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Edit";
    			attr_dev(button, "class", "tasks__edit svelte-ffdv5s");
    			attr_dev(button, "type", "button");
    			add_location(button, file, 71, 6, 1947);
    			dispose = listen_dev(button, "click", /*showEditingInputs*/ ctx[6], false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(71:5) {#if !todo.editable}",
    		ctx
    	});

    	return block;
    }

    // (53:2) {#each todos as todo, i}
    function create_each_block(ctx) {
    	let div4;
    	let div0;
    	let t0_value = /*i*/ ctx[17] + 1 + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div2;
    	let t3;
    	let div3;
    	let t4;
    	let button;
    	let button_data_index_value;
    	let div3_data_index_value;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (!/*todo*/ ctx[15].editable) return create_if_block_2;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (!/*todo*/ ctx[15].editable) return create_if_block_1;
    		return create_else_block_1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function select_block_type_2(ctx, dirty) {
    		if (!/*todo*/ ctx[15].editable) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type_2 = select_block_type_2(ctx);
    	let if_block2 = current_block_type_2(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			if_block0.c();
    			t2 = space();
    			div2 = element("div");
    			if_block1.c();
    			t3 = space();
    			div3 = element("div");
    			if_block2.c();
    			t4 = space();
    			button = element("button");
    			button.textContent = "Delete";
    			attr_dev(div0, "class", "tasks__number");
    			add_location(div0, file, 54, 4, 1441);
    			attr_dev(div1, "class", "tasks__name svelte-ffdv5s");
    			add_location(div1, file, 55, 4, 1488);
    			attr_dev(div2, "class", "tasks__description svelte-ffdv5s");
    			add_location(div2, file, 62, 4, 1663);
    			attr_dev(button, "class", "tasks__delete svelte-ffdv5s");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "data-index", button_data_index_value = /*i*/ ctx[17]);
    			add_location(button, file, 82, 5, 2806);
    			attr_dev(div3, "class", "tasks__action svelte-ffdv5s");
    			attr_dev(div3, "data-index", div3_data_index_value = /*i*/ ctx[17]);
    			add_location(div3, file, 69, 4, 1859);
    			attr_dev(div4, "class", "tasks__item svelte-ffdv5s");
    			add_location(div4, file, 53, 3, 1411);
    			dispose = listen_dev(button, "click", /*deleteTask*/ ctx[5], false, false, false);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, t0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			if_block0.m(div1, null);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			if_block1.m(div2, null);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			if_block2.m(div3, null);
    			append_dev(div3, t4);
    			append_dev(div3, button);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div2, null);
    				}
    			}

    			if (current_block_type_2 === (current_block_type_2 = select_block_type_2(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if_block2.d(1);
    				if_block2 = current_block_type_2(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div3, t4);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if_block0.d();
    			if_block1.d();
    			if_block2.d();
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(53:2) {#each todos as todo, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div3;
    	let h1;
    	let t1;
    	let div2;
    	let t2;
    	let div0;
    	let button;
    	let t4;
    	let div1;
    	let input0;
    	let t5;
    	let input1;
    	let t6;
    	let a;
    	let svg;
    	let path0;
    	let path1;
    	let dispose;
    	let each_value = /*todos*/ ctx[4];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "To Do!";
    			t1 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "+";
    			t4 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			a = element("a");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			attr_dev(h1, "class", "text-center svelte-ffdv5s");
    			add_location(h1, file, 49, 1, 1322);
    			attr_dev(button, "class", "tasks__add svelte-ffdv5s");
    			add_location(button, file, 88, 3, 2977);
    			attr_dev(div0, "class", "tasks__add_wrapper svelte-ffdv5s");
    			add_location(div0, file, 87, 2, 2941);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Name");
    			attr_dev(input0, "class", "svelte-ffdv5s");
    			add_location(input0, file, 92, 3, 3140);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "placeholder", "description");
    			attr_dev(input1, "class", "svelte-ffdv5s");
    			add_location(input1, file, 93, 3, 3210);
    			attr_dev(path0, "d", "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z");
    			attr_dev(path0, "fill", "blue");
    			add_location(path0, file, 95, 87, 3433);
    			attr_dev(path1, "d", "M0 0h24v24H0z");
    			attr_dev(path1, "fill", "none");
    			add_location(path1, file, 95, 146, 3492);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			add_location(svg, file, 95, 4, 3350);
    			attr_dev(a, "href", "#add");
    			attr_dev(a, "class", "svelte-ffdv5s");
    			add_location(a, file, 94, 3, 3294);
    			attr_dev(div1, "class", "tasks__adding svelte-ffdv5s");
    			attr_dev(div1, "title", "Add new task");
    			toggle_class(div1, "active", /*adding*/ ctx[3]);
    			add_location(div1, file, 91, 2, 3062);
    			attr_dev(div2, "class", "tasks svelte-ffdv5s");
    			add_location(div2, file, 51, 1, 1361);
    			attr_dev(div3, "class", "wrapper svelte-ffdv5s");
    			add_location(div3, file, 48, 0, 1299);

    			dispose = [
    				listen_dev(
    					button,
    					"click",
    					function () {
    						/*click_handler_1*/ ctx[12].apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				),
    				listen_dev(input0, "input", /*input0_input_handler*/ ctx[13]),
    				listen_dev(input1, "input", /*input1_input_handler*/ ctx[14]),
    				listen_dev(a, "click", prevent_default(/*addTodo*/ ctx[8]), false, true, false)
    			];
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h1);
    			append_dev(div3, t1);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div0);
    			append_dev(div0, button);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*newTask*/ ctx[2].name);
    			append_dev(div1, t5);
    			append_dev(div1, input1);
    			set_input_value(input1, /*newTask*/ ctx[2].description);
    			append_dev(div1, t6);
    			append_dev(div1, a);
    			append_dev(a, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*deleteTask, todos, showEditingInputs, editTask, description, task*/ 243) {
    				each_value = /*todos*/ ctx[4];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty[0] & /*newTask*/ 4 && input0.value !== /*newTask*/ ctx[2].name) {
    				set_input_value(input0, /*newTask*/ ctx[2].name);
    			}

    			if (dirty[0] & /*newTask*/ 4 && input1.value !== /*newTask*/ ctx[2].description) {
    				set_input_value(input1, /*newTask*/ ctx[2].description);
    			}

    			if (dirty[0] & /*adding*/ 8) {
    				toggle_class(div1, "active", /*adding*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let task = "";
    	let description = "";
    	let newTask = { name: "", description: "" };
    	let adding = false;

    	let todos = [
    		{
    			name: "Svelte",
    			description: "Testing Svelte",
    			editable: false
    		},
    		{
    			name: "React",
    			description: "Testing React",
    			editable: false
    		},
    		{
    			name: "Vue",
    			description: "Consolidate knowledge",
    			editable: false
    		}
    	];

    	const deleteTask = e => {
    		const index = +e.target.getAttribute("data-index");

    		if (confirm(`Delete ${todos[index].name} task?`)) {
    			todos.splice(index, 1);
    			$$invalidate(4, todos);
    		}
    	};

    	const showEditingInputs = e => {
    		const index = +e.target.closest(".tasks__action").getAttribute("data-index");
    		$$invalidate(0, task = todos[index].name);
    		$$invalidate(1, description = todos[index].description);
    		$$invalidate(4, todos[index].editable = true, todos);
    	};

    	const editTask = e => {
    		const index = +e.target.closest(".tasks__action").getAttribute("data-index");
    		$$invalidate(4, todos[index].name = task, todos);
    		$$invalidate(4, todos[index].description = description, todos);
    		$$invalidate(4, todos[index].editable = false, todos);
    	};

    	const addTodo = () => {
    		$$invalidate(2, newTask.editable = false, newTask);
    		todos.push(newTask);
    		$$invalidate(4, todos);
    		$$invalidate(2, newTask = { name: "", description: "" });
    	};

    	function input_input_handler() {
    		task = this.value;
    		$$invalidate(0, task);
    	}

    	function input_input_handler_1() {
    		description = this.value;
    		$$invalidate(1, description);
    	}

    	const click_handler = (todo, e) => $$invalidate(4, todo.editable = false, todos);
    	const click_handler_1 = e => $$invalidate(3, adding = !adding);

    	function input0_input_handler() {
    		newTask.name = this.value;
    		$$invalidate(2, newTask);
    	}

    	function input1_input_handler() {
    		newTask.description = this.value;
    		$$invalidate(2, newTask);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ("task" in $$props) $$invalidate(0, task = $$props.task);
    		if ("description" in $$props) $$invalidate(1, description = $$props.description);
    		if ("newTask" in $$props) $$invalidate(2, newTask = $$props.newTask);
    		if ("adding" in $$props) $$invalidate(3, adding = $$props.adding);
    		if ("todos" in $$props) $$invalidate(4, todos = $$props.todos);
    	};

    	return [
    		task,
    		description,
    		newTask,
    		adding,
    		todos,
    		deleteTask,
    		showEditingInputs,
    		editTask,
    		addTodo,
    		input_input_handler,
    		input_input_handler_1,
    		click_handler,
    		click_handler_1,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class ToDo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ToDo",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new ToDo({
    	target: document.body,
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
