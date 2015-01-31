/*!
 * jQuery.filer
 * Copyright (c) 2015 CreativeDream
 * Website: http://creativedream.net/plugins/jquery.filer
 * Version: 1.0 (30-01-2015)
 * Requires: jQuery v1.7.1 or later
 */
(function($) {
    "use strict";

    $.fn.filer = function(q) {
        return this.each(function(t, r) {
            var s = $(r),
                b = '.jFiler',
                p = $(),
                o = $(),
                l = $(),
                sl = [],
                n = $.extend(true, {}, $.fn.filer.defaults, q),
                f = {
                    init: function() {
                        s.wrap('<div class="jFiler"></div>');
                        p = s.closest(b);
                        f._changeInput();
                    },

                    _bindInput: function() {
                        if (n.changeInput && o.size() > 0) {
                            o.bind("click", f._clickHandler);
                        }
                        s.on({
                            "focus": function() {
                                o.addClass('focused');
                            },
                            "blur": function() {
                                o.removeClass('focused');
                            },
                            "change": function() {
                                f._onChange();
                            }
                        });
                        if (n.dragDrop) {
                            (o.length > 0 ? o : s).bind("drop", f._dragDrop.drop).bind("dragover", f._dragDrop.dragEnter).bind("dragleave", f._dragDrop.dragLeave);
                        }
                        if (n.uploadFile && n.clipBoardPaste) {
                            $(window).on("paste", f._clipboardPaste);
                        }
                    },

                    _unbindInput: function() {
                        if (n.changeInput && o.size() > 0) {
                            o.unbind("click", f._clickHandler);
                        }
                    },

                    _clickHandler: function() {
                        s.click()
                    },

                    _applyAttrSettings: function() {
                        var d = ["name", "limit", "maxSize", "extensions", "changeInput", "showThumbs", "appendTo", "theme", "addMore", "excludeName", "files"];

                        for (var k in d) {
                            var j = "data-jfiler-" + d[k];
                            if (f._assets.hasAttr(j)) {
                                switch (d[k]) {
                                    case "changeInput":
                                    case "showThumbs":
                                    case "addMore":
                                        n[d[k]] = (["true", "false"].indexOf(s.attr(j)) > -1 ? s.attr(j) == "true" : s.attr(j));
                                        break;
                                    case "extensions":
                                        n[d[k]] = s.attr(j).replace(/ /g, '').split(",");
                                        break;
                                    case "files":
                                        n[d[k]] = JSON.parse(s.attr(j));
                                        break;
                                    default:
                                        n[d[k]] = s.attr(j);
                                }

                                s.removeAttr(j);
                            }
                        }
                    },

                    _changeInput: function() {
                        f._applyAttrSettings();
                        if (n.theme) {
                            p.addClass('jFiler-theme-' + n.theme);
                        }
                        if (s.get(0).tagName.toLowerCase() != "input" && s.get(0).type != "file") {
                            o = s;
                            s = $("<input type=\"file\" name=\"" + n.name + "\" />");
                            s.css({
                                position: "absolute",
                                left: "-9999px",
                                top: "-9999px",
                                "z-index": "-9999"
                            });
                            p.prepend(s);
                            f._isGn = s;
                        } else {
                            if (n.changeInput) {
                                switch (typeof n.changeInput) {
                                    case "boolean":
                                        o = $('<div class="jFiler-input"><div class="jFiler-input-caption"><span>' + n.captions.feedback + '</span></div><div class="jFiler-input-button">' + n.captions.button + '</div></div>"');
                                        break;
                                    case "string":
                                    case "object":
                                        o = $(n.changeInput);
                                        break;
                                    case "function":
                                        o = $(n.changeInput(p, s, n));
                                        break;
                                }
                                s.after(o);
                                s.css({
                                    position: "absolute",
                                    left: "-9999px",
                                    top: "-9999px",
                                    "z-index": "-9999"
                                });
                            }
                        }
                        if (!n.limit || (n.limit && n.limit >= 2)) {
                            s.attr("multiple", "multiple");
                            s.attr("name").slice(-2) != "[]" ? s.attr("name", s.attr("name") + "[]") : null;
                        }
                        f._bindInput();

                        if (n.files) {
                            f._append(false, {
                                files: n.files
                            });
                        }
                    },

                    _clear: function() {
                        f.files = null;
                        if (!n.uploadFile && !n.addMore) {
                            f._reset();
                        }
                        f._set('feedback', (f._itFl && f._itFl.length > 0 ? f._itFl.length + ' ' + n.captions.feedback2 : n.captions.feedback));
                        n.onEmpty != null && typeof n.onEmpty == "function" ? n.onEmpty(p, o, s) : null
                    },

                    _reset: function(a) {
                        if (!a) {
                            if (!n.uploadFile && n.addMore) {
                                for (var i = 0; i < sl.length; i++) {
                                    sl[i].remove();
                                }
                                sl = [];
                                f._unbindInput();
                                if (f._isGn) {
                                    s = f._isGn;
                                } else {
                                    s = $(r);
                                }
                                f._bindInput();
                            }
                            f._set('input', '');
                        }
                        f._itFl = [];
                        f._itFc = null;
                        p.find("input[name^='jfiler-items-exclude-']:hidden").remove();
                        l.fadeOut("fast", function() {
                            $(this).remove();
                        });
                        l = $();
                    },

                    _set: function(element, value) {
                        switch (element) {
                            case 'input':
                                s.val("");
                                break;
                            case 'feedback':
                                if (o.length > 0) {
                                    o.find('.jFiler-input-caption span').html(value);
                                }
                                break;
                        }
                    },

                    _filesCheck: function() {
                        var s = 0;
                        if (n.limit && f.files.length + f._itFl.length > n.limit) {
                            alert(f._assets.textParse(n.captions.errors.filesLimit));
                            return false
                        }
                        for (var t = 0; t < f.files.length; t++) {
                            var x = f.files[t].name.split(".").pop().toLowerCase(),
                                file = f.files[t],
                                m = {
                                    name: file.name,
                                    size: file.size,
                                    size2: f._assets.bytesToSize(file.size),
                                    type: file.type,
                                    ext: x
                                };
                            if (n.extensions != null && $.inArray(x, n.extensions) == -1) {
                                alert(f._assets.textParse(n.captions.errors.filesType, m));
                                return false;
                                break
                            }
                            if (n.maxSize != null && f.files[t].size > n.maxSize * 1048576) {
                                alert(f._assets.textParse(n.captions.errors.filesSize, m));
                                return false;
                                break
                            }
                            if (file.size == 4096 && file.type.length == 0) {
                                return false;
                                break
                            }
                            s += f.files[t].size
                        }
                        if (n.maxSize != null && s >= Math.round(n.maxSize * 1048576)) {
                            alert(f._assets.textParse(n.captions.errors.filesSizeAll));
                            return false
                        }
                        if ((n.addMore || n.uploadFile)) {
                            var m = f._itFl.filter(function(a, b) {
                                if (a.file.name == file.name && a.file.size == file.size && a.file.type == file.type && (file.lastModified ? a.file.lastModified == file.lastModified : true)) {
                                    return true;
                                }
                            });

                            if (m.length > 0) {
                                return false
                            }
                        }
                        return true;
                    },

                    _thumbCreator: {
                        create: function(i) {
                            var file = f.files[i],
                                id = (f._itFc ? f._itFc.id : i),
                                name = file.name,
                                size = file.size,
                                type = file.type.split("/", 1).toString().toLowerCase(),
                                ext = name.indexOf(".") != -1 ? name.split(".").pop().toLowerCase() : "",
                                progressBar = n.uploadFile ? '<div class="jFiler-jProgressBar">' + n.templates.progressBar + '</div>' : '',
                                opts = {
                                    id: id,
                                    name: name,
                                    size: size,
                                    size2: f._assets.bytesToSize(size),
                                    type: type,
                                    extension: ext,
                                    icon: f._assets.getIcon(ext, type),
                                    icon2: f._thumbCreator.generateIcon({
                                        type: type,
                                        extension: ext
                                    }),
                                    image: '<div class="jFiler-item-thumb-image fi-loading"></div>',
                                    progressBar: progressBar,
                                    _appended: file._appended
                                },
                                html = "";

                            if (file.opts) {
                                opts = $.extend({}, file.opts, opts);
                            }

                            html = $(f._thumbCreator.renderContent(opts)).attr("data-jfiler-index", id);
                            html.get(0).jfiler_id = id;

                            f._thumbCreator.renderFile(file, html, opts);

                            if (file.forList) {
                                return html;
                            }

                            f._itFc.html = html;

                            html.hide()[n.templates.itemAppendToEnd ? "appendTo" : "prependTo"](l.find(n.templates._selectors.list)).show();

                            if (!file._appended) {
                                f._onSelect(i);
                            }
                        },
                        renderContent: function(opts) {
                            return f._assets.textParse((opts._appended ? n.templates.itemAppend : n.templates.item), opts);
                        },
                        renderFile: function(file, html, opts) {
                            if (html.find('.jFiler-item-thumb-image').size() == 0) {
                                return false;
                            }
                            if (file.file && opts.type == "image") {
                                var g = '<img src="' + file.file + '" draggable="false" />',
                                    m = html.find('.jFiler-item-thumb-image.fi-loading');
                                $(g).error(function() {
                                    g = f._thumbCreator.generateIcon(opts);
                                    html.addClass('jFiler-no-thumbnail');
                                    m.removeClass('fi-loading').html(g);
                                }).load(function() {
                                    m.removeClass('fi-loading').html(g);
                                });
                                return true;
                            }
                            if (window.File && window.FileList && window.FileReader && opts.type == "image") {
                                var y = new FileReader;
                                y.onload = function(e) {
                                    var g = '<img src="' + e.target.result + '" draggable="false" />',
                                        m = html.find('.jFiler-item-thumb-image.fi-loading');
                                    $(g).error(function() {
                                        g = f._thumbCreator.generateIcon(opts);
                                        html.addClass('jFiler-no-thumbnail');
                                        m.removeClass('fi-loading').html(g);
                                    }).load(function() {
                                        m.removeClass('fi-loading').html(g);
                                    });
                                };
                                y.readAsDataURL(file);
                            } else {
                                var g = f._thumbCreator.generateIcon(opts),
                                    m = html.find('.jFiler-item-thumb-image.fi-loading');
                                html.addClass('jFiler-no-thumbnail');
                                m.removeClass('fi-loading').html(g);
                            }
                        },
                        generateIcon: function(obj) {
                            var m = new Array(3);
                            if (obj && obj.type && obj.extension) {
                                switch (obj.type) {
                                    case "image":
                                        m[0] = "f-image";
                                        m[1] = "<i class=\"icon-jfi-file-image\"></i>"
                                        break;
                                    case "video":
                                        m[0] = "f-video";
                                        m[1] = "<i class=\"icon-jfi-file-video\"></i>"
                                        break;
                                    case "audio":
                                        m[0] = "f-audio";
                                        m[1] = "<i class=\"icon-jfi-file-audio\"></i>"
                                        break;
                                    default:
                                        m[0] = "f-file f-file-ext-" + obj.extension;
                                        m[1] = (obj.extension.length > 0 ? "." + obj.extension : "");
                                        m[2] = 1
                                }
                            } else {
                                m[0] = "f-file";
                                m[1] = (obj.extension && obj.extension.length > 0 ? "." + obj.extension : "");
                                m[2] = 1
                            }
                            var el = '<span class="jFiler-icon-file ' + m[0] + '">' + m[1] + '</span>';
                            if (m[2] == 1) {
                                var c = f._assets.text2Color(obj.extension);
                                if (c) {
                                    var j = $(el).appendTo("body"),
                                        h = j.css("box-shadow");
                                    h = c + h.substring(h.replace(/^.*(rgba?\([^)]+\)).*$/, '$1').length, h.length);
                                    j.css({
                                        '-webkit-box-shadow': h,
                                        '-moz-box-shadow': h,
                                        'box-shadow': h
                                    });
                                    el = j.prop('outerHTML');
                                    j.remove();
                                }
                            }
                            return el;
                        },
                        _box: function(params) {
                            if (n.beforeShow != null && typeof n.beforeShow == "function" ? !n.beforeShow(f.files, l, p, o, s) : false) {
                                return false
                            }
                            if (l.length < 1) {

                                if (n.appendTo) {
                                    var appendTo = $(n.appendTo);
                                } else {
                                    var appendTo = p;
                                }

                                appendTo.find('.jFiler-items').remove();
                                l = $('<div class="jFiler-items jFiler-row"></div>');
                                l.append(f._assets.textParse(n.templates.box)).appendTo(appendTo);

                                l.on('click', n.templates._selectors.remove, function(e) {
                                    e.preventDefault();
                                    var cf = n.templates.removeConfirmation ? confirm(n.captions.removeConfirmation) : true;
                                    if (cf) {
                                        f._remove(params ? params.remove.event : e, params ? params.remove.el : $(this).closest(n.templates._selectors.item));
                                    }
                                });
                            }
                            for (var i = 0; i < f.files.length; i++) {
                                f._addToMemory(i);
                                f._thumbCreator.create(i);
                            }
                        }
                    },

                    _upload: function(i) {
                        var el = f._itFc.html,
                            formData = new FormData();

                        formData.append(s.attr('name'), f._itFc.file, (f._itFc.file.name ? f._itFc.file.name : false));
                        if (n.uploadFile.data != null && $.isPlainObject(n.uploadFile.data)) {
                            for (k in n.uploadFile.data) {
                                formData.append(k, n.uploadFile.data[k])
                            }
                        }
                        f._ajax.send(el, formData, f._itFc);
                    },

                    _ajax: {
                        send: function(el, formData, c) {
                            c.ajax = $.ajax({
                                url: n.uploadFile.url,
                                data: formData,
                                type: n.uploadFile.type,
                                enctype: n.uploadFile.enctype,
                                xhr: function() {
                                    var myXhr = $.ajaxSettings.xhr();
                                    if (myXhr.upload) {
                                        myXhr.upload.addEventListener("progress", function(e) {
                                            f._ajax.progressHandling(e, el)
                                        }, false)
                                    }
                                    return myXhr
                                },
                                complete: function() {
                                    c.ajax = false;
                                },
                                beforeSend: function(jqXHR, settings) {
                                    return n.uploadFile.beforeSend != null && typeof n.uploadFile.beforeSend == "function" ? n.uploadFile.beforeSend(el, l, p, o, s, jqXHR, settings) : true;
                                },
                                success: function(data, textStatus, jqXHR) {
                                    c.uploaded = true;
                                    n.uploadFile.success != null && typeof n.uploadFile.success == "function" ? n.uploadFile.success(data, el, l, p, o, s, textStatus, jqXHR) : null
                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    c.uploaded = false;
                                    n.uploadFile.error != null && typeof n.uploadFile.error == "function" ? n.uploadFile.error(el, l, p, o, s, jqXHR, textStatus, errorThrown) : null
                                },
                                statusCode: n.uploadFile.statusCode,
                                cache: false,
                                contentType: false,
                                processData: false
                            });
                            return c.ajax;
                        },
                        progressHandling: function(e, el) {
                            if (e.lengthComputable) {
                                var t = Math.round(e.loaded * 100 / e.total).toString();
                                n.uploadFile.onProgress != null && typeof n.uploadFile.onProgress == "function" ? n.uploadFile.onProgress(t, el, l, p, o, s) : null;
                                el.find('.jFiler-jProgressBar').find(n.templates._selectors.progressBar).css("width", t + "%")
                            }
                        }
                    },

                    _dragDrop: {
                        dragEnter: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            p.addClass('dragged');
                            f._set('feedback', n.captions.drop);
                            n.dragDrop.dragEnter != null && typeof n.dragDrop.dragEnter == "function" ? n.dragDrop.dragEnter(e, o, s, p) : null;
                        },
                        dragLeave: function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!f._dragDrop._dragLeaveCheck(e)) {
                                return false
                            }
                            p.removeClass('dragged');
                            f._set('feedback', n.captions.feedback);
                            n.dragDrop.dragLeave != null && typeof n.dragDrop.dragLeave == "function" ? n.dragDrop.dragLeave(e, o, s, p) : null;
                        },
                        drop: function(e) {
                            e.preventDefault();
                            p.removeClass('dragged');
                            if (!e.originalEvent.dataTransfer.files || e.originalEvent.dataTransfer.files.length <= 0) {
                                return;
                            }
                            f._set('feedback', n.captions.feedback);
                            f._onChange(e, e.originalEvent.dataTransfer.files);
                            n.dragDrop.drop != null && typeof n.dragDrop.drop == "function" ? n.dragDrop.drop(e.originalEvent.dataTransfer.files, e, o, s, p) : null;
                        },
                        _dragLeaveCheck: function(e) {
                            var related = e.relatedTarget,
                                inside = false;
                            if (related !== o) {
                                if (related) {
                                    inside = $.contains(o, related);
                                }
                                if (inside) {
                                    return false;
                                }
                            }
                            return true;
                        }
                    },

                    _clipboardPaste: function(e, fromDrop) {
                        if (!fromDrop && (!e.originalEvent.clipboardData && !e.originalEvent.clipboardData.items)) {
                            return
                        }
                        if (fromDrop && (!e.originalEvent.dataTransfer && !e.originalEvent.dataTransfer.items)) {
                            return
                        }
                        if (f._clPsePre) {
                            return
                        }
                        var items = (fromDrop ? e.originalEvent.dataTransfer.items : e.originalEvent.clipboardData.items),
                            b64toBlob = function(b64Data, contentType, sliceSize) {
                                contentType = contentType || '';
                                sliceSize = sliceSize || 512;
                                var byteCharacters = atob(b64Data);
                                var byteArrays = [];
                                for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                                    var slice = byteCharacters.slice(offset, offset + sliceSize);
                                    var byteNumbers = new Array(slice.length);
                                    for (var i = 0; i < slice.length; i++) {
                                        byteNumbers[i] = slice.charCodeAt(i);
                                    }
                                    var byteArray = new Uint8Array(byteNumbers);
                                    byteArrays.push(byteArray);
                                }
                                var blob = new Blob(byteArrays, {
                                    type: contentType
                                });
                                return blob;
                            };
                        if (items) {
                            for (var i = 0; i < items.length; i++) {
                                if (items[i].type.indexOf("image") !== -1 || items[i].type.indexOf("text/uri-list") !== -1) {
                                    if (fromDrop) {
                                        try {
                                            window.atob(e.originalEvent.dataTransfer.getData("text/uri-list").toString().split(',')[1]);
                                        } catch (e) {
                                            return;
                                        }
                                    }
                                    var blob = (fromDrop ? b64toBlob(e.originalEvent.dataTransfer.getData("text/uri-list").toString().split(',')[1], "image/png") : items[i].getAsFile());
                                    blob.name = Math.random().toString(36).substring(5);
                                    blob.name += blob.type.indexOf("/") != -1 ? "." + blob.type.split("/")[1].toString().toLowerCase() : ".png";
                                    f._onChange(e, [blob]);
                                    f._clPsePre = setTimeout(function() {
                                        delete f._clPsePre
                                    }, 1000);
                                }
                            }
                        }
                    },

                    _onSelect: function(i) {
                        if (n.uploadFile && !$.isEmptyObject(n.uploadFile)) {
                            f._upload(i)
                        }
                        n.onSelect != null && typeof n.onSelect == "function" ? n.onSelect(f.files[i], f._itFc.html, l, p, o, s) : null;
                        if (i + 1 >= f.files.length) {
                            n.afterShow != null && typeof n.afterShow == "function" ? n.afterShow(l, p, o, s) : null
                        }
                    },

                    _onChange: function(e, d) {
                        if (!d) {
                            if (!s.get(0).files || typeof s.get(0).files == "undefined" || s.get(0).files.length == 0) {
                                if (!n.uploadFile && !n.addMore) {
                                    f._set('input', '');
                                    f._clear();
                                }
                                return false
                            }
                            f.files = s.get(0).files;
                        } else {
                            if (!d || d.length == 0) {
                                f._set('input', '');
                                f._clear();
                                return false
                            }
                            f.files = d;
                        }
                        if (!n.uploadFile && !n.addMore) {
                            f._reset(true);
                        }
                        if (!f._filesCheck()) {
                            f._set('input', '');
                            f._clear();
                            return false
                        }
                        f._set('feedback', f.files.length + f._itFl.length + ' ' + n.captions.feedback2);
                        if (n.showThumbs) {
                            f._thumbCreator._box();
                        } else {
                            for (var i = 0; i < f.files.length; i++) {
                                f._addToMemory(i);
                                f._onSelect(i);
                            }
                        }
                        if (!n.uploadFile && n.addMore) {
                            var elem = $('<input type="file" />');
                            var attributes = s.prop("attributes");
                            $.each(attributes, function() {
                                elem.attr(this.name, this.value);
                            });
                            s.after(elem);
                            f._unbindInput();
                            sl.push(elem);
                            s = elem;
                            f._bindInput();
                        }
                    },

                    _append: function(e, data) {
                        var files = (!data ? false : data.files);
                        if (!files || files.length <= 0) {
                            return;
                        }
                        f.files = files;
                        if (n.showThumbs) {
                            for (var i = 0; i < f.files.length; i++) {
                                f.files[i]._appended = true;
                            }
                            f._thumbCreator._box();
                        }
                    },

                    _getList: function(e, data) {
                        var files = (!data ? false : data.files);
                        if (!files || files.length <= 0) {
                            return;
                        }
                        f.files = files;
                        if (n.showThumbs) {
                            var returnData = [];
                            for (var i = 0; i < f.files.length; i++) {
                                f.files[i].forList = true;
                                returnData.push(f._thumbCreator.create(i));
                            }
                            if (data.callback) {
                                data.callback(returnData, l, p, o, s);
                            }
                        }
                    },

                    _remove: function(e, el) {
                        if (el.binded) {
                            if (el.data.id) {
                                el = l.find(n.templates._selectors.item + "[data-jfiler-index='" + el.data.id + "']");
                                if (el.size() == 0) {
                                    return false
                                }
                            }
                            if (el.data.el) {
                                el = el.data.el;
                            }
                        }
                        var attrId = el.get(0).jfiler_id || el.attr('data-jfiler-index'),
                            id = null,
                            excl_input = function(id) {
                                var input = p.find("input[name^='jfiler-items-exclude-']:hidden").first(),
                                    file = f._itFl[id].file,
                                    val = [];

                                if (input.size() == 0) {
                                    input = $('<input type="hidden" name="jfiler-items-exclude-' + (n.excludeName ? n.excludeName : (s.attr("name").slice(-2) != "[]" ? s.attr("name") : s.attr("name").substring(0, s.attr("name").length - 2)) + "-" + t) + '">');
                                    input.appendTo(p);
                                } else {
                                    val = JSON.parse(input.val());
                                }
                                val.push(file.name);
                                val = JSON.stringify(val);
                                input.val(val);
                            },
                            callback = function(el, id) {
                                excl_input(id);

                                f._itFl.splice(id, 1);

                                if (f._itFl.length < 1) {
                                    f._reset();
                                    f._clear();
                                } else {
                                    f._set('feedback', f._itFl.length + ' ' + n.captions.feedback2);
                                }

                                el.fadeOut("fast", function() {
                                    $(this).remove();
                                });
                            };
                        for (var key in f._itFl) {
                            if (key === 'length' || !f._itFl.hasOwnProperty(key)) continue;
                            if (f._itFl[key].id == attrId) {
                                id = key;
                            }
                        }
                        if (!f._itFl.hasOwnProperty(id)) {
                            return false
                        }
                        if (f._itFl[id].ajax) {
                            f._itFl[id].ajax.abort();
                            callback(el, id);
                            return;
                        }
                        n.onRemove != null && typeof n.onRemove == "function" ? n.onRemove(el, f._itFl[id].file, id, l, p, o, s) : null;
                        callback(el, id);
                    },

                    _addToMemory: function(i) {
                        f._itFl.push({
                            id: f._itFl.length,
                            file: f.files[i],
                            html: $(),
                            ajax: false,
                            uploaded: false,
                        });
                        f._itFc = f._itFl[f._itFl.length - 1];
                    },

                    _assets: {
                        bytesToSize: function(bytes) {
                            if (bytes == 0) return '0 Byte';
                            var k = 1000;
                            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
                            var i = Math.floor(Math.log(bytes) / Math.log(k));
                            return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
                        },
                        hasAttr: function(attr, el) {
                            var el = (!el ? s : el),
                                a = el.attr(attr);
                            if (!a || typeof a == "undefined") {
                                return false;
                            } else {
                                return true;
                            }
                        },
                        getIcon: function(ext, type) {
                            var types = ["audio", "image", "text", "video"];
                            if ($.inArray(type, types) > -1) {
                                return '<i class="icon-jfi-file-' + type + ' jfi-file-ext-' + ext + '"></i>';
                            }
                            return '<i class="icon-jfi-file-o jfi-file-type-' + type + ' jfi-file-ext-' + ext + '"></i>';
                        },
                        textParse: function(text, opts) {
                            opts = $.extend({}, {
                                limit: n.limit,
                                maxSize: n.maxSize
                            }, (opts && $.isPlainObject(opts) ? opts : {}));
                            switch (typeof(text)) {
                                case "string":
                                    return text.replace(/\{\{fi-(.*?)\}\}/g, function(match, a) {
                                        a = a.replace(/ /g, '');

                                        if (a.match(/(.*?)\|limitTo\:(\d+)/)) {
                                            return a.replace(/(.*?)\|limitTo\:(\d+)/, function(match, a, b) {
                                                var a = (opts[a] ? opts[a] : ""),
                                                    str = a.substring(0, b);
                                                str = (a.length > str.length ? str.substring(0, str.length - 3) + "..." : str);
                                                return str;
                                            });
                                        } else {
                                            return (opts[a] ? opts[a] : "");
                                        }

                                    });
                                    break;
                                case "function":
                                    return text(opts);
                                    break;
                                default:
                                    return text;
                            }
                        },
                        text2Color: function(str) {
                            if (!str || str.length == 0) {
                                return false
                            }
                            for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));
                            for (var i = 0, colour = "#"; i < 3; colour += ("00" + ((hash >> i++ * 2) & 0xFF).toString(16)).slice(-2));
                            return colour;
                        }
                    },

                    files: null,
                    _itFl: [],
                    _itFc: null
                }

            f.init();
            s.on("filer.append", function(e, data) {
                f._append(e, data)
            });
            s.on("filer.remove", function(e, data) {
                data.binded = true;
                f._remove(e, data);
            });
            s.on("filer.reset", function(e) {
                f._reset();
                f._clear();
                return true;
            });
            s.on("filer.generateList", function(e, data) {
                return f._getList(e, data)
            });
            return this;
        });
    };

    $.fn.filer.defaults = {
        limit: null,
        maxSize: null,
        extensions: null,
        changeInput: true,
        showThumbs: false,
        appendTo: null,
        theme: null,
        templates: {
            box: null,
            item: null,
            itemAppend: null,
            progressBar: null,
            itemAppendToEnd: false,
            removeConfirmation: true,
            _selectors: {
                list: null,
                item: null,
                progressBar: null,
                remove: null,
            }
        },
        files: null,
        uploadFile: null,
        dragDrop: null,
        addMore: false,
        clipBoardPaste: true,
        excludeName: null,
        beforeShow: null,
        onSelect: null,
        afterShow: null,
        onRemove: null,
        onEmpty: null,
        captions: {
            button: "Choose Files",
            feedback: "Choose files To Upload",
            feedback2: "files were chosen",
            drop: "Drop file here to Upload",
            removeConfirmation: "Are you sure you want to remove this file?",
            errors: {
                filesLimit: "Only {{fi-limit}} files are allowed to be uploaded.",
                filesType: "Only Images are allowed to be uploaded.",
                filesSize: "{{fi-name}} is too large! Please upload file up to {{fi-maxSize}} MB.",
                filesSizeAll: "Files you've choosed are too large! Please upload files up to {{fi-maxSize}} MB."
            }
        }
    }
})(jQuery);
