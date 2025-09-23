import * as React from 'react';

export type GardenObject = {
  id: string;
  name: string;
  price: number;
  icon: string;
  image: string; // Path to image asset
};

export type PlacedObject = GardenObject & {
  x: number;
  y: number;
};
