declare module "text-readability" {
  export function lexiconCount(text: string): number;
  export function sentenceCount(text: string): number;
  export function syllableCount(text: string): number;
  export function fleschKincaidGrade(text: string): number;
  export function textStandard(text: string, floatOutput?: boolean): number;

  // fallback "any" export for safety
  const _default: any;
  export default _default;
}
