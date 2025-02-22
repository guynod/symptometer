/// <reference types="nativewind/types" />
declare module "*.png";

// Add support for importing static images
declare module "*.jpg" {
  const content: any;
  export default content;
}

declare module "*.svg" {
  const content: any;
  export default content;
} 