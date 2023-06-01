export default function BodyText({ text, clsName }) {
    const findLinksAndReplace = () => {
      // let linkRegex = new RegExp("\\[(.*?)\\]\\((.*?)\\)", "g");
      let linkRegex = new RegExp('\\[([^\\s\\]]+)\\]\\((https?:\\/\\/[^\\s)]+)\\)', 'g')
  
      return text.replace(linkRegex, (match, p1, p2) => {
        return `<a href="${p2}" target="_blank">${p1}</a>`;
      });
    };
  
    return (
      <p
        className={clsName}
        dangerouslySetInnerHTML={{ __html: findLinksAndReplace() }}
      />
    );
  }