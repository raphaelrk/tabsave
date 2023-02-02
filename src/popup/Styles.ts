import type { Interpolation, Theme } from "@emotion/react";
export type Style = Interpolation<Theme>;
export type Styles = { [name: string]: Style };