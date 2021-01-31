var defaultOptions = {
  headings: 'h1, h2, h3'
}

var aTag = function(src) {
  var a = document.createElement('a');
  var content = src.firstChild.innerHTML;

  // 使用这个限制长度，未使用。
  // https://github.com/arendjr/text-clipper
  a.innerHTML = content;
  a.href = src.firstChild.href;
  a.onclick = activeClass;

  return a
};

var activeClass = function(e) {
  var divs = document.querySelectorAll('#jx-toc .active');

  // 删除之前的样式
  [].forEach.call(divs, function(div) {
    div.setAttribute('class', '')
  });

  // 给当前点击的项加入新的样式
  e.target.parentNode.setAttribute('class', 'active')
};

var createList = function(wrapper, count) {
  while (count--) {
    wrapper = wrapper.appendChild(
      document.createElement('ul')
    );

    if (count) {
      wrapper = wrapper.appendChild(
        document.createElement('li')
      );
    }
  }

  return wrapper;
};

var getHeaders = function(selector) {
  var allHeadings = document.querySelectorAll(selector);
  var ret = [];

  [].forEach.call(allHeadings, function(heading) {
    ret = ret.concat(heading);
  });

  return ret;
};

var getLevel = function(header) {
  var decs = header.match(/\d/g);

  return decs ? Math.min.apply(null, decs) : 1;
};

var jumpBack = function(currentWrapper, offset) {
  while (offset--) {
    currentWrapper = currentWrapper.parentElement;
  }

  return currentWrapper;
};

var buildTOC = function(options) {
  var ret = document.createElement('ul');
  var wrapper = ret;
  var lastLi = null;
  var selector = '.markdown-section ' + options.headings
  var headers = getHeaders(selector).filter(h => h.id);

  headers.reduce(function(prev, curr, index) {
    var currentLevel = getLevel(curr.tagName);
    var offset = currentLevel - prev;

    wrapper = (offset > 0)
      ? createList(lastLi || ret, offset)
      : jumpBack(wrapper, -offset * 2)

    wrapper = wrapper || ret;

    var li = document.createElement('li');

    wrapper.appendChild(li).appendChild(aTag(curr));

    lastLi = li;

    return currentLevel;
  }, getLevel(options.headings));

  return ret;
};

var goTopFunction = function(e) {
  e.stopPropagation();
  var step = window.scrollY / 50;
  var scroll = function() {
      window.scrollTo(0, window.scrollY - step);
      if(window.scrollY > 0) {
          setTimeout(scroll, 10);
      }
  };
  scroll();
};

// Docsify plugin functions
function plugin(hook, vm) {
  var userOptions = vm.config.jxtoc;

  hook.mounted(function () {
    var content = window.Docsify.dom.find(".content");
    if (content) {
      var jxtoc = window.Docsify.dom.create("div", "");
      jxtoc.id = "jx-toc"
      window.Docsify.dom.before(content, jxtoc);

      var jxGoTop = window.Docsify.dom.create("span", "<i class='fas fa-arrow-up'></i>");
      jxGoTop.id = "jx-gotop";
      jxGoTop.onclick = goTopFunction;
      window.Docsify.dom.before(content, jxGoTop);
    }
  });

  hook.doneEach(function () {
    var jxtoc = document.getElementById('jx-toc');

    if (!jxtoc) {
      return;
    }
    jxtoc.innerHTML = null

  	const toc = buildTOC(userOptions);

    if (!toc.innerHTML) {
      return;
    }

		var TocAnchor = document.createElement('i');
    TocAnchor.setAttribute('class', 'fas fa-list');

		jxtoc.appendChild(TocAnchor);
    jxtoc.appendChild(toc);
  });
}

// Docsify plugin options
window.$docsify['jx-toc'] = Object.assign(defaultOptions, window.$docsify['jx-toc']);
window.$docsify.plugins = [].concat(plugin, window.$docsify.plugins);
