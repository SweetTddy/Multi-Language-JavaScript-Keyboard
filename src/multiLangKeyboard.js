var multiLangKeyboard = new function () {
  this.version   = '0.1.0';
  this.keyboard  = null;
  this.keyboards = {};

  this.options = {
    wrapClass: 'multi-lang-keyboard-wrap',
    localize:  {
      backspace: 'Backspace',
      enter:     'Enter',
      space:     'Space',
      shift:     'Shift',
      alt:       'Alt'
    }
  };


  function validateKeyboardCode(keyboards, code) {
    var valid = (keyboards[code] !== undefined);
    if (!valid) console.error("multiLangKeyboard: keyboard '", code, "' not found");
    return valid;
  }


  function validateKeyboardElement(selector) {
    var valid = (document.querySelector(selector) !== null);
    if (!valid) console.error("multiLangKeyboard: keyboard selector '", selector, "' not found");
    return valid;
  }


  function validateKeyboardInputElement(selector) {
    var valid = (document.querySelector(selector) !== null);
    if (!valid) console.error("multiLangKeyboard: keyboard input selector '", selector, "' not found");
    return valid;
  }


  this.addKeyboard = function (name, code, layout) {
    this.keyboards[code] = {name: name, layout: layout};
  };


  this.availableKeyboards = function () {
    var result = [];

    for (var code in this.keyboards) {
      result.push({code: code, name: this.keyboards[code].name});
    }

    return result;
  };


  this.render = function (code, selector, input_selector) {
    if (!validateKeyboardCode(this.keyboards, code)) return;
    if (!validateKeyboardElement(selector)) return;
    if (!validateKeyboardInputElement(input_selector)) return;

    var keyboard_wrap_el = document.querySelector(selector);
    var input_el         = document.querySelector(input_selector);

    keyboard_wrap_el.innerHTML = this.renderHTML(code);
    this.addEvents(keyboard_wrap_el.querySelector('.' + this.options.wrapClass), input_el);
  };


  this.renderHTML = function (code) {
    var keyboard = this.keyboards[code];

    var wrap = document.createElement('div');

    wrap.setAttribute('class', this.options.wrapClass);
    wrap.setAttribute('data-alt', 'false');
    wrap.setAttribute('data-events', 'false');
    wrap.setAttribute('data-shift', 'false');
    wrap.setAttribute('data-keyboard-name', keyboard.name);
    wrap.setAttribute('data-keyboard-code', code);

    for (var i = 0; i < keyboard.layout.length; i++) {
      var layoutRow = keyboard.layout[i];
      var tableEl   = document.createElement('table');
      var tr        = document.createElement('tr');

      for (var ii = 0; ii < layoutRow.length; ii++) {
        var layoutKey = layoutRow[ii];
        var td        = document.createElement('td');

        if (layoutKey.special === 'spacer') {
          td.setAttribute('class', 'spacer');

        } else if (layoutKey.special !== null) {
          td.setAttribute('class', 'special-key');
          td.setAttribute('data-action', layoutKey.special);
          td.innerText = this.options.localize[layoutKey.special];

        } else {
          td.setAttribute('class', 'key');
          if (layoutKey.title) td.setAttribute('title', layoutKey.title);
          if (layoutKey.default) td.setAttribute('data-default', layoutKey.default);
          if (layoutKey.shift) td.setAttribute('data-shift', layoutKey.shift);
          if (layoutKey.alt) td.setAttribute('data-alt', layoutKey.alt);
          if (layoutKey.alt_shift) td.setAttribute('data-alt-shift', layoutKey.alt_shift);

          if (layoutKey.default) {
            var span_default       = document.createElement('span');
            span_default.innerText = layoutKey.default;
            span_default.setAttribute('class', 'default');
            td.appendChild(span_default);
          }

          if (layoutKey.shift) {
            var span_shift       = document.createElement('span');
            span_shift.innerText = layoutKey.shift;
            span_shift.setAttribute('class', 'shift');
            td.appendChild(span_shift);
          }

          if (layoutKey.alt_shift) {
            var span_alt_shift       = document.createElement('span');
            span_alt_shift.innerText = layoutKey.alt_shift;
            span_alt_shift.setAttribute('class', 'alt-shift');
            td.appendChild(span_alt_shift);
          }

          if (layoutKey.alt) {
            var span_alt       = document.createElement('span');
            span_alt.innerText = layoutKey.alt;
            span_alt.setAttribute('class', 'alt');
            td.appendChild(span_alt);
          }
        }

        tr.appendChild(td);
      }

      tableEl.appendChild(tr);
      wrap.appendChild(tableEl);
    }

    return wrap.outerHTML;
  };


  this.addEvents = function (wrap, input) {
    var keys = wrap.querySelectorAll('.key, .special-key');

    for (var i = 0; i < keys.length; i++) {
      keys[i].onclick = function (e) { handleKeyPress(e, this); };
    }

    function handleKeyPress(e, key) {
      var action = key.getAttribute('data-action');

      switch (action) {
        case 'backspace':
          handleBackspace(input);
          break;

        case 'enter':
          insertAtInputCaretPos(input, "\u000d");
          break;

        case 'shift':
          wrap.setAttribute('data-shift', (shiftDown() ? 'false' : 'true'));
          break;

        case 'alt':
          wrap.setAttribute('data-alt', (altDown() ? 'false' : 'true'));
          break;

        case 'space':
          insertAtInputCaretPos(input, ' ');
          break;

        case null:
          var value = null;

          if (altDown() && shiftDown()) {
            if (key.getAttribute('data-alt-shift') !== '') value = key.getAttribute('data-alt-shift');
          } else if (altDown()) {
            if (key.getAttribute('data-alt') !== '') value = key.getAttribute('data-alt');
          } else if (shiftDown()) {
            if (key.getAttribute('data-shift') !== '') value = key.getAttribute('data-shift');
          } else {
            value = key.getAttribute('data-default');
          }

          if (value !== null) insertAtInputCaretPos(input, value);

          wrap.setAttribute('data-shift', 'false');
          wrap.setAttribute('data-alt', 'false');
          break;
      }
    }

    function shiftDown() {
      return wrap.getAttribute('data-shift') === 'true';
    }

    function altDown() {
      return wrap.getAttribute('data-alt') === 'true';
    }

    function insertAtInputCaretPos(input, value) {
      var range = getCaretRange(input);

      input.value = input.value.slice(0, range[0]) + value + input.value.slice(range[1], input.value.length);

      if (range[0] === range[1]) {
        input.setSelectionRange(range[1] + value.length, range[1] + value.length);
      } else {
        input.setSelectionRange(range[0] + value.length, range[0] + value.length);
      }
    }

    function handleBackspace(input) {
      var range = getCaretRange(input);

      if (range[0] === range[1] && range[0] > 0) {
        input.value = input.value.slice(0, range[0] - 1) + input.value.slice(range[0], input.value.length);
        input.setSelectionRange(range[0] - 1, range[0] - 1);
      }

      if (range[0] !== range[1]) {
        input.value = input.value.slice(0, range[0]) + input.value.slice(range[1], input.value.length);
        input.setSelectionRange(range[0], range[0]);
      }
    }

    function getCaretRange(input) {
      input.focus();
      return [input.selectionStart, input.selectionEnd];
    }

  };
}();
