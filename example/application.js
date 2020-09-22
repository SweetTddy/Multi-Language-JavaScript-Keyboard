if (window.addEventListener) {
  window.addEventListener('load', ready);
} else {
  window.attachEvent('onload', ready);
}

function ready() {
  multiLangKeyboard.options.wrapClass = 'multi-lang-keyboard-wrap';
  multiLangKeyboard.options.localize  = {
    shift:     'Shift',
    alt:       'Alt',
    space:     'Space',
    backspace: 'Backspace',
    enter:     'Enter'
  };

  var keyboards = multiLangKeyboard.availableKeyboards();

  for (var i = 0; i < keyboards.length; i++) {
    var keyboard = keyboards[i];

    var id = ('keyboard-' + keyboard.code);

    var wrap = document.createElement('div');
    wrap.setAttribute('class', 'wrap');
    wrap.setAttribute('id', id);

    var title       = document.createElement('h3');
    title.innerText = (keyboard.name + ' (' + keyboard.code + ')');
    wrap.appendChild(title);

    wrap.appendChild(document.createElement('textarea'));

    var keyboard_wrap = document.createElement('div');
    keyboard_wrap.setAttribute('class', 'keyboard');
    wrap.appendChild(keyboard_wrap);

    document.querySelector('body').appendChild(wrap);

    multiLangKeyboard.render(
      keyboard.code,
      '#' + id + ' .keyboard',
      '#' + id + ' textarea'
    );
  }
}
