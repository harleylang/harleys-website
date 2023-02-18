/**
 * show-html-comments.ts
 * @description
 * This module will find all elements that have the "htmlCommentToggle"
 * attribute, attach an event listener that fires on click. The event
 * will bubble and when caught, will toggle displaying inline HTML
 * comments within this document.
 */

// TODO: use DOM mutation observer to remove and re-attach listeners

(() => {
  function dispatchHtmlToggleEvent() {
    const commentToggleEvent = new CustomEvent('toggleHtmlComments');
    document.dispatchEvent(commentToggleEvent);
  }

  function attachHtmlToggleListeners() {
    const toggles = document.querySelectorAll('[htmlCommentToggle]');
    for (let t = 0; t < toggles.length; t += 1) {
      const toggle = toggles[t];
      toggle.addEventListener('click', dispatchHtmlToggleEvent);
    }
  }

  /**
   * findCommentNodes
   * Search the DOM for all comments.
   * @see https://stackoverflow.com/a/6028120/14198287
   */
  function findCommentNodes(el: Document | HTMLElement | ChildNode) {
    // deno-lint-ignore no-var
    var arr: ChildNode[] = [];
    const nodes = Array.from(el.childNodes);
    nodes.forEach((node) => {
      if (node.nodeType === Node.COMMENT_NODE) {
        arr.push(node);
      } else {
        arr.push(...findCommentNodes(node));
      }
    });
    return arr;
  }

  function handleHtmlToggleEvents() {
    const commentNodes = findCommentNodes(document);
    const commentsRevealed = Array.from(
      document.querySelectorAll('[htmlCommentRevealed]'),
    );
    if (commentsRevealed.length > 0) {
      commentsRevealed.forEach((c) => c.remove());
    } else {
      commentNodes.forEach((comment) => {
        const sibling = (comment as HTMLElement).previousElementSibling;
        if (sibling && comment.parentNode !== null) {
          const p = document.createElement('p');
          p.innerText = `&lt;!-- ${comment.nodeValue ?? ''} --&gt;`;
          p.setAttribute('htmlCommentRevealed', '');
          p.addEventListener('click', (event: Event) => (event.target as HTMLElement).remove());
          comment.parentNode.insertBefore(p, comment);
        }
      });
    }
  }

  attachHtmlToggleListeners();
  document.addEventListener('toggleHtmlComments', handleHtmlToggleEvents);
})();
