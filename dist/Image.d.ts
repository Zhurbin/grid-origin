import React from 'react';
import { ShapeConfig } from 'konva/types/Shape';
export interface ImageProps extends ShapeConfig {
    url: string;
    spacing?: number;
}
declare const ImageComponent: React.FC<ImageProps>;
export default ImageComponent;
