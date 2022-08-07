/**
 * show-html-comments.mjs
 * @description
 * This module will find all elements that have the "htmlCommentToggle"
 * attribute, attach an event listener that fires on click. The event
 * will bubble and when caught, will toggle displaying inline HTML
 * comments within this document.
 */

// TODO: use DOM mutation observer to remove and re-attach listeners

function dispatchHtmlToggleEvent() {
  const commentToggleEvent = new CustomEvent("toggleHtmlComments");
  document.dispatchEvent(commentToggleEvent);
}

function attachHtmlToggleListeners() {
  const toggles = document.querySelectorAll("[htmlCommentToggle]");
  for (let t = 0; t < toggles.length; t += 1) {
    const toggle = toggles[t];
    toggle.addEventListener("click", dispatchHtmlToggleEvent);
  }
}

function findCommentNodes(el: Document | HTMLElement | ChildNode) {
  // eslint-disable-next-line no-var
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

  commentNodes.forEach((comment) => {
    const sibling = (comment as HTMLElement).previousElementSibling;
    if (sibling) {
      const isRevealed =
        typeof (sibling as unknown as HTMLElement).getAttribute(
          "htmlCommentRevealed"
        ) === "string";
      switch (true) {
        case isRevealed:
          sibling.remove();
          break;
        default:
          if (comment.parentNode !== null) {
            const p = document.createElement("p");
            p.innerHTML = `&lt;!-- ${comment.nodeValue ?? ""} --&gt;`;
            p.setAttribute("htmlCommentRevealed", "");
            comment.parentNode.insertBefore(p, comment);
          }
          break;
      }
    }
  });
}

attachHtmlToggleListeners();
document.addEventListener("toggleHtmlComments", handleHtmlToggleEvents);
