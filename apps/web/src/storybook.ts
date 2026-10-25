// The Storybook runs on its own port in development, and as its own Worker once deployed.
export const storybookUrl = import.meta.env.DEV
  ? "http://localhost:6006/"
  : "https://yosegi-storybook.learningishardiswear.workers.dev/";

/** A docs page in the Storybook, by its id, such as "guides-getting-started". */
export const storybookDocs = (id: string) => `${storybookUrl}?path=/docs/${id}--docs`;
