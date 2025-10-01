export type TextMessage = {
  id: string;
  sender: "user" | "pai";
  text: string;
};

export type ImageMessage = {
  id: string;
  sender: "user" | "pai";
  image: string;
};

export type Message = TextMessage | ImageMessage;