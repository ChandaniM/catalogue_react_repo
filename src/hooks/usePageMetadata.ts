import { useEffect } from 'react';

const usePageMetadata = (title: string, description: string) => {
  useEffect(() => {
    document.title = title;

    let descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.name = 'description';
      document.head.appendChild(descriptionTag);
    }

    descriptionTag.content = description.replace(/\s+/g, ' ').trim().slice(0, 160);
  }, [title, description]);
};

export default usePageMetadata;
