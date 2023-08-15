(function () {
    var on = addEventListener,
        off = removeEventListener,
        $ = function (q) {
            return document.querySelector(q);
        },
        $$ = function (q) {
            return document.querySelectorAll(q);
        },
        $body = document.body,
        $inner = $(".inner"),
        client = (function () {
            var o = { browser: "other", browserVersion: 0, os: "other", osVersion: 0, mobile: false, canUse: null, flags: { lsdUnits: false } },
                ua = navigator.userAgent,
                a,
                i;
            a = [
                ["firefox", /Firefox\/([0-9\.]+)/],
                ["edge", /Edge\/([0-9\.]+)/],
                ["safari", /Version\/([0-9\.]+).+Safari/],
                ["chrome", /Chrome\/([0-9\.]+)/],
                ["chrome", /CriOS\/([0-9\.]+)/],
                ["ie", /Trident\/.+rv:([0-9]+)/],
            ];
            for (i = 0; i < a.length; i++) {
                if (ua.match(a[i][1])) {
                    o.browser = a[i][0];
                    o.browserVersion = parseFloat(RegExp.$1);
                    break;
                }
            }
            a = [
                [
                    "ios",
                    /([0-9_]+) like Mac OS X/,
                    function (v) {
                        return v.replace("_", ".").replace("_", "");
                    },
                ],
                [
                    "ios",
                    /CPU like Mac OS X/,
                    function (v) {
                        return 0;
                    },
                ],
                [
                    "ios",
                    /iPad; CPU/,
                    function (v) {
                        return 0;
                    },
                ],
                ["android", /Android ([0-9\.]+)/, null],
                [
                    "mac",
                    /Macintosh.+Mac OS X ([0-9_]+)/,
                    function (v) {
                        return v.replace("_", ".").replace("_", "");
                    },
                ],
                ["windows", /Windows NT ([0-9\.]+)/, null],
                ["undefined", /Undefined/, null],
            ];
            for (i = 0; i < a.length; i++) {
                if (ua.match(a[i][1])) {
                    o.os = a[i][0];
                    o.osVersion = parseFloat(a[i][2] ? a[i][2](RegExp.$1) : RegExp.$1);
                    break;
                }
            }
            if (
                o.os == "mac" &&
                "ontouchstart" in window &&
                ((screen.width == 1024 && screen.height == 1366) || (screen.width == 834 && screen.height == 1112) || (screen.width == 810 && screen.height == 1080) || (screen.width == 768 && screen.height == 1024))
            )
                o.os = "ios";
            o.mobile = o.os == "android" || o.os == "ios";
            var _canUse = document.createElement("div");
            o.canUse = function (property, value) {
                var style;
                style = _canUse.style;
                if (!(property in style)) return false;
                if (typeof value !== "undefined") {
                    style[property] = value;
                    if (style[property] == "") return false;
                }
                return true;
            };
            o.flags.lsdUnits = o.canUse("width", "100dvw");
            return o;
        })(),
        trigger = function (t) {
            dispatchEvent(new Event(t));
        },
        cssRules = function (selectorText) {
            var ss = document.styleSheets,
                a = [],
                f = function (s) {
                    var r = s.cssRules,
                        i;
                    for (i = 0; i < r.length; i++) {
                        if (r[i] instanceof CSSMediaRule && matchMedia(r[i].conditionText).matches) f(r[i]);
                        else if (r[i] instanceof CSSStyleRule && r[i].selectorText == selectorText) a.push(r[i]);
                    }
                },
                x,
                i;
            for (i = 0; i < ss.length; i++) f(ss[i]);
            return a;
        },
        thisHash = function () {
            var h = location.hash ? location.hash.substring(1) : null,
                a;
            if (!h) return null;
            if (h.match(/\?/)) {
                a = h.split("?");
                h = a[0];
                history.replaceState(undefined, undefined, "#" + h);
                window.location.search = a[1];
            }
            if (h.length > 0 && !h.match(/^[a-zA-Z]/)) h = "x" + h;
            if (typeof h == "string") h = h.toLowerCase();
            return h;
        },
        scrollToElement = function (e, style, duration) {
            var y, cy, dy, start, easing, offset, f;
            if (!e) y = 0;
            else {
                offset = (e.dataset.scrollOffset ? parseInt(e.dataset.scrollOffset) : 0) * parseFloat(getComputedStyle(document.documentElement).fontSize);
                switch (e.dataset.scrollBehavior ? e.dataset.scrollBehavior : "default") {
                    case "default":
                    default:
                        y = e.offsetTop + offset;
                        break;
                    case "center":
                        if (e.offsetHeight < window.innerHeight) y = e.offsetTop - (window.innerHeight - e.offsetHeight) / 2 + offset;
                        else y = e.offsetTop - offset;
                        break;
                    case "previous":
                        if (e.previousElementSibling) y = e.previousElementSibling.offsetTop + e.previousElementSibling.offsetHeight + offset;
                        else y = e.offsetTop + offset;
                        break;
                }
            }
            if (!style) style = "smooth";
            if (!duration) duration = 750;
            if (style == "instant") {
                window.scrollTo(0, y);
                return;
            }
            start = Date.now();
            cy = window.scrollY;
            dy = y - cy;
            switch (style) {
                case "linear":
                    easing = function (t) {
                        return t;
                    };
                    break;
                case "smooth":
                    easing = function (t) {
                        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                    };
                    break;
            }
            f = function () {
                var t = Date.now() - start;
                if (t >= duration) window.scroll(0, y);
                else {
                    window.scroll(0, cy + dy * easing(t / duration));
                    requestAnimationFrame(f);
                }
            };
            f();
        },
        scrollToTop = function () {
            scrollToElement(null);
        },
        loadElements = function (parent) {
            var a, e, x, i;
            a = parent.querySelectorAll('iframe[data-src]:not([data-src=""])');
            for (i = 0; i < a.length; i++) {
                a[i].contentWindow.location.replace(a[i].dataset.src);
                a[i].dataset.initialSrc = a[i].dataset.src;
                a[i].dataset.src = "";
            }
            a = parent.querySelectorAll("video[autoplay]");
            for (i = 0; i < a.length; i++) {
                if (a[i].paused) a[i].play();
            }
            e = parent.querySelector('[data-autofocus="1"]');
            x = e ? e.tagName : null;
            switch (x) {
                case "FORM":
                    e = e.querySelector(".field input, .field select, .field textarea");
                    if (e) e.focus();
                    break;
                default:
                    break;
            }
        },
        unloadElements = function (parent) {
            var a, e, x, i;
            a = parent.querySelectorAll('iframe[data-src=""]');
            for (i = 0; i < a.length; i++) {
                if (a[i].dataset.srcUnload === "0") continue;
                if ("initialSrc" in a[i].dataset) a[i].dataset.src = a[i].dataset.initialSrc;
                else a[i].dataset.src = a[i].src;
                a[i].contentWindow.location.replace("about:blank");
            }
            a = parent.querySelectorAll("video");
            for (i = 0; i < a.length; i++) {
                if (!a[i].paused) a[i].pause();
            }
            e = $(":focus");
            if (e) e.blur();
        };
    window._scrollToTop = scrollToTop;
    var thisUrl = function () {
        return window.location.href.replace(window.location.search, "").replace(/#$/, "");
    };
    var getVar = function (name) {
        var a = window.location.search.substring(1).split("&"),
            b,
            k;
        for (k in a) {
            b = a[k].split("=");
            if (b[0] == name) return b[1];
        }
        return null;
    };
    var errors = {
        handle: function (handler) {
            window.onerror = function (message, url, line, column, error) {
                handler(error.message);
                return true;
            };
        },
        unhandle: function () {
            window.onerror = null;
        },
    };
    var db = {
        open: function (objectStoreName, handler) {
            var request = indexedDB.open("carrd");
            request.onupgradeneeded = function (event) {
                event.target.result.createObjectStore(objectStoreName, { keyPath: "id" });
            };
            request.onsuccess = function (event) {
                handler(event.target.result.transaction([objectStoreName], "readwrite").objectStore(objectStoreName));
            };
        },
        put: function (objectStore, values, handler) {
            var request = objectStore.put(values);
            request.onsuccess = function (event) {
                handler();
            };
            request.onerror = function (event) {
                throw new Error("db.put: error");
            };
        },
        get: function (objectStore, id, handler) {
            var request = objectStore.get(id);
            request.onsuccess = function (event) {
                if (!event.target.result) throw new Error('db.get: could not retrieve object with id "' + id + '"');
                handler(event.target.result);
            };
            request.onerror = function (event) {
                throw new Error("db.get: error");
            };
        },
        delete: function (objectStore, id, handler) {
            objectStore.delete(id).onsuccess = function (event) {
                handler(event.target.result);
            };
        },
    };
    var loadHandler = function () {
        setTimeout(function () {
            $body.classList.remove("is-loading");
            $body.classList.add("is-playing");
            setTimeout(function () {
                $body.classList.remove("is-playing");
                $body.classList.add("is-ready");
            }, 1000);
        }, 100);
    };
    on("load", loadHandler);
    (function () {
        var initialSection,
            initialScrollPoint,
            initialId,
            header,
            footer,
            name,
            hideHeader,
            hideFooter,
            disableAutoScroll,
            h,
            e,
            ee,
            k,
            locked = false,
            scrollPointParent = function (target) {
                while (target) {
                    if (target.parentElement && target.parentElement.tagName == "SECTION") break;
                    target = target.parentElement;
                }
                return target;
            },
            scrollPointSpeed = function (scrollPoint) {
                let x = parseInt(scrollPoint.dataset.scrollSpeed);
                switch (x) {
                    case 5:
                        return 250;
                    case 4:
                        return 500;
                    case 3:
                        return 750;
                    case 2:
                        return 1000;
                    case 1:
                        return 1250;
                    default:
                        break;
                }
                return 750;
            },
            doNextScrollPoint = function (event) {
                var e, target, id;
                event.preventDefault();
                event.stopPropagation();
                e = scrollPointParent(event.target);
                if (!e) return;
                while (e && e.nextElementSibling) {
                    e = e.nextElementSibling;
                    if (e.dataset.scrollId) {
                        target = e;
                        id = e.dataset.scrollId;
                        break;
                    }
                }
                if (!target || !id) return;
                if (target.dataset.scrollInvisible == "1") scrollToElement(target, "smooth", scrollPointSpeed(target));
                else location.href = "#" + id;
            },
            doPreviousScrollPoint = function (e) {
                var e, target, id;
                event.preventDefault();
                event.stopPropagation();
                e = scrollPointParent(event.target);
                if (!e) return;
                while (e && e.previousElementSibling) {
                    e = e.previousElementSibling;
                    if (e.dataset.scrollId) {
                        target = e;
                        id = e.dataset.scrollId;
                        break;
                    }
                }
                if (!target || !id) return;
                if (target.dataset.scrollInvisible == "1") scrollToElement(target, "smooth", scrollPointSpeed(target));
                else location.href = "#" + id;
            },
            doFirstScrollPoint = function (e) {
                var e, target, id;
                event.preventDefault();
                event.stopPropagation();
                e = scrollPointParent(event.target);
                if (!e) return;
                while (e && e.previousElementSibling) {
                    e = e.previousElementSibling;
                    if (e.dataset.scrollId) {
                        target = e;
                        id = e.dataset.scrollId;
                    }
                }
                if (!target || !id) return;
                if (target.dataset.scrollInvisible == "1") scrollToElement(target, "smooth", scrollPointSpeed(target));
                else location.href = "#" + id;
            },
            doLastScrollPoint = function (e) {
                var e, target, id;
                event.preventDefault();
                event.stopPropagation();
                e = scrollPointParent(event.target);
                if (!e) return;
                while (e && e.nextElementSibling) {
                    e = e.nextElementSibling;
                    if (e.dataset.scrollId) {
                        target = e;
                        id = e.dataset.scrollId;
                    }
                }
                if (!target || !id) return;
                if (target.dataset.scrollInvisible == "1") scrollToElement(target, "smooth", scrollPointSpeed(target));
                else location.href = "#" + id;
            },
            doNextSection = function () {
                var section;
                section = $("#main > .inner > section.active").nextElementSibling;
                if (!section || section.tagName != "SECTION") return;
                location.href = "#" + section.id.replace(/-section$/, "");
            },
            doPreviousSection = function () {
                var section;
                section = $("#main > .inner > section.active").previousElementSibling;
                if (!section || section.tagName != "SECTION") return;
                location.href = "#" + (section.matches(":first-child") ? "" : section.id.replace(/-section$/, ""));
            },
            doFirstSection = function () {
                var section;
                section = $("#main > .inner > section:first-of-type");
                if (!section || section.tagName != "SECTION") return;
                location.href = "#" + section.id.replace(/-section$/, "");
            },
            doLastSection = function () {
                var section;
                section = $("#main > .inner > section:last-of-type");
                if (!section || section.tagName != "SECTION") return;
                location.href = "#" + section.id.replace(/-section$/, "");
            },
            resetSectionChangeElements = function (section) {
                var ee, e, x;
                ee = section.querySelectorAll('[data-reset-on-section-change="1"]');
                for (e of ee) {
                    x = e ? e.tagName : null;
                    switch (x) {
                        case "FORM":
                            e.reset();
                            break;
                        default:
                            break;
                    }
                }
            },
            activateSection = function (section, scrollPoint) {
                var sectionHeight, currentSection, currentSectionHeight, name, hideHeader, hideFooter, disableAutoScroll, ee, k;
                if (!section.classList.contains("inactive")) {
                    name = section ? section.id.replace(/-section$/, "") : null;
                    disableAutoScroll = name ? name in sections && "disableAutoScroll" in sections[name] && sections[name].disableAutoScroll : false;
                    if (scrollPoint) scrollToElement(scrollPoint, "smooth", scrollPointSpeed(scrollPoint));
                    else if (!disableAutoScroll) scrollToElement(null);
                    return false;
                } else {
                    locked = true;
                    if (location.hash == "#home") history.replaceState(null, null, "#");
                    name = section ? section.id.replace(/-section$/, "") : null;
                    disableAutoScroll = name ? name in sections && "disableAutoScroll" in sections[name] && sections[name].disableAutoScroll : false;
                    currentSection = $("section:not(.inactive)");
                    if (currentSection) {
                        currentSection.classList.add("inactive");
                        unloadElements(currentSection);
                        resetSectionChangeElements(currentSection);
                        setTimeout(function () {
                            currentSection.style.display = "none";
                            currentSection.classList.remove("active");
                        }, 250);
                    }
                    setTimeout(function () {
                        section.style.display = "";
                        trigger("resize");
                        if (!disableAutoScroll) scrollToElement(null, "instant");
                        setTimeout(function () {
                            section.classList.remove("inactive");
                            section.classList.add("active");
                            setTimeout(function () {
                                loadElements(section);
                                if (scrollPoint) scrollToElement(scrollPoint, "instant");
                                locked = false;
                            }, 500);
                        }, 75);
                    }, 250);
                }
            },
            sections = {};
        window._nextScrollPoint = doNextScrollPoint;
        window._previousScrollPoint = doPreviousScrollPoint;
        window._firstScrollPoint = doFirstScrollPoint;
        window._lastScrollPoint = doLastScrollPoint;
        window._nextSection = doNextSection;
        window._previousSection = doPreviousSection;
        window._firstSection = doFirstSection;
        window._lastSection = doLastSection;
        window._scrollToTop = function () {
            var section, id;
            scrollToElement(null);
            if (!!(section = $("section.active"))) {
                id = section.id.replace(/-section$/, "");
                if (id == "home") id = "";
                history.pushState(null, null, "#" + id);
            }
        };
        if ("scrollRestoration" in history) history.scrollRestoration = "manual";
        header = $("#header");
        footer = $("#footer");
        h = thisHash();
        if (h && !h.match(/^[a-zA-Z0-9\-]+$/)) h = null;
        if ((e = $('[data-scroll-id="' + h + '"]'))) {
            initialScrollPoint = e;
            initialSection = initialScrollPoint.parentElement;
            initialId = initialSection.id;
        } else if ((e = $("#" + (h ? h : "home") + "-section"))) {
            initialScrollPoint = null;
            initialSection = e;
            initialId = initialSection.id;
        }
        if (!initialSection) {
            initialScrollPoint = null;
            initialSection = $("#" + "home" + "-section");
            initialId = initialSection.id;
            history.replaceState(undefined, undefined, "#");
        }
        name = h ? h : "home";
        hideHeader = name ? name in sections && "hideHeader" in sections[name] && sections[name].hideHeader : false;
        hideFooter = name ? name in sections && "hideFooter" in sections[name] && sections[name].hideFooter : false;
        disableAutoScroll = name ? name in sections && "disableAutoScroll" in sections[name] && sections[name].disableAutoScroll : false;
        if (header && hideHeader) {
            header.classList.add("hidden");
            header.style.display = "none";
        }
        if (footer && hideFooter) {
            footer.classList.add("hidden");
            footer.style.display = "none";
        }
        ee = $$('#main > .inner > section:not([id="' + initialId + '"])');
        for (k = 0; k < ee.length; k++) {
            ee[k].className = "inactive";
            ee[k].style.display = "none";
        }
        initialSection.classList.add("active");
        loadElements(initialSection);
        if (header) loadElements(header);
        if (footer) loadElements(footer);
        if (!disableAutoScroll) scrollToElement(null, "instant");
        on("load", function () {
            if (initialScrollPoint) scrollToElement(initialScrollPoint, "instant");
        });
        on("hashchange", function (event) {
            var section, scrollPoint, h, e;
            if (locked) return false;
            h = thisHash();
            if (h && !h.match(/^[a-zA-Z0-9\-]+$/)) return false;
            if ((e = $('[data-scroll-id="' + h + '"]'))) {
                scrollPoint = e;
                section = scrollPoint.parentElement;
            } else if ((e = $("#" + (h ? h : "home") + "-section"))) {
                scrollPoint = null;
                section = e;
            } else {
                scrollPoint = null;
                section = $("#" + "home" + "-section");
                history.replaceState(undefined, undefined, "#");
            }
            if (!section) return false;
            activateSection(section, scrollPoint);
            return false;
        });
        on("click", function (event) {
            var t = event.target,
                tagName = t.tagName.toUpperCase(),
                scrollPoint,
                section;
            switch (tagName) {
                case "IMG":
                case "SVG":
                case "USE":
                case "U":
                case "STRONG":
                case "EM":
                case "CODE":
                case "S":
                case "MARK":
                case "SPAN":
                    while (!!(t = t.parentElement)) if (t.tagName == "A") break;
                    if (!t) return;
                    break;
                default:
                    break;
            }
            if (t.tagName == "A" && t.getAttribute("href").substr(0, 1) == "#") {
                if (!!(scrollPoint = $('[data-scroll-id="' + t.hash.substr(1) + '"][data-scroll-invisible="1"]'))) {
                    event.preventDefault();
                    section = scrollPoint.parentElement;
                    if (section.classList.contains("inactive")) {
                        history.pushState(null, null, "#" + section.id.replace(/-section$/, ""));
                        activateSection(section, scrollPoint);
                    } else {
                        scrollToElement(scrollPoint, "smooth", scrollPointSpeed(scrollPoint));
                    }
                } else if (t.hash == window.location.hash) {
                    event.preventDefault();
                    history.replaceState(undefined, undefined, "#");
                    location.replace(t.hash);
                }
            }
        });
    })();
    var style, sheet, rule;
    style = document.createElement("style");
    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);
    sheet = style.sheet;
    if (client.mobile) {
        (function () {
            if (client.flags.lsdUnits) {
                document.documentElement.style.setProperty("--viewport-height", "100svh");
                document.documentElement.style.setProperty("--background-height", "100lvh");
            } else {
                var f = function () {
                    document.documentElement.style.setProperty("--viewport-height", window.innerHeight + "px");
                    document.documentElement.style.setProperty("--background-height", window.innerHeight + 250 + "px");
                };
                on("load", f);
                on("orientationchange", function () {
                    setTimeout(function () {
                        f();
                    }, 100);
                });
            }
        })();
    }
    if (client.os == "android") {
        (function () {
            sheet.insertRule("body::after { }", 0);
            rule = sheet.cssRules[0];
            var f = function () {
                rule.style.cssText = "height: " + Math.max(screen.width, screen.height) + "px";
            };
            on("load", f);
            on("orientationchange", f);
            on("touchmove", f);
        })();
        $body.classList.add("is-touch");
    } else if (client.os == "ios") {
        if (client.osVersion <= 11)
            (function () {
                sheet.insertRule("body::after { }", 0);
                rule = sheet.cssRules[0];
                rule.style.cssText = "-webkit-transform: scale(1.0)";
            })();
        if (client.osVersion <= 11)
            (function () {
                sheet.insertRule("body.ios-focus-fix::before { }", 0);
                rule = sheet.cssRules[0];
                rule.style.cssText = "height: calc(100% + 60px)";
                on(
                    "focus",
                    function (event) {
                        $body.classList.add("ios-focus-fix");
                    },
                    true
                );
                on(
                    "blur",
                    function (event) {
                        $body.classList.remove("ios-focus-fix");
                    },
                    true
                );
            })();
        $body.classList.add("is-touch");
    }
    var scrollTracking = {
        elements: [],
        add: function (selector) {
            var _this = this;
            $$(selector).forEach(function (e) {
                _this.elements.push(e);
            });
        },
        resizeHandler: function () {
            this.elements.forEach(function (e) {
                e.style.setProperty("--element-top", e.offsetTop);
            });
        },
        scrollHandler: function () {
            document.documentElement.style.setProperty("--scroll-y", window.scrollY);
        },
        init: function () {
            var _this = this;
            on("scroll", function () {
                _this.scrollHandler();
            });
            on("load", function () {
                _this.scrollHandler();
            });
            this.scrollHandler();
            on("resize", function () {
                _this.resizeHandler();
            });
            on("load", function () {
                _this.resizeHandler();
            });
            this.resizeHandler();
            let x = new ResizeObserver(function (entries) {
                _this.scrollHandler();
                _this.resizeHandler();
            });
            x.observe($body);
        },
    };
    scrollTracking.init();                                
})();