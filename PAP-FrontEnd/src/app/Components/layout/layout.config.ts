import { Vector2 } from "../../../types/vector"

const LayoutConfigs: any = {

    Components: {
        Table: {
            Image: 'Backgrounds/Wood.jpg',
        },
        RoundTable: {
            Image: 'Backgrounds/Wood.jpg',
        },
        Chair1: {
            Image: 'LayoutComponents/Chair1.webp',
        },
        Chair2: {
            Image: 'LayoutComponents/Chair2.webp',
        },
        Wall: {
            Size: new Vector2(20, 2.5),
            MinSize: new Vector2(2.5, 2.5)
        },
        WCSign: {
            Image: 'LayoutComponents/restroom.svg',
            
            Size: new Vector2(15, 15),
            MinSize: new Vector2(10, 10),
        },
        Door1: {
            Image: 'LayoutComponents/Door1.webp',
            Size: new Vector2(20, 7.5),
            MinSize: new Vector2(2.5, 2.5)
        },
        Door2: {
            Image: 'LayoutComponents/Door2.webp',
            Size: new Vector2(20, 7.5),
            MinSize: new Vector2(2.5, 2.5)
        },
        Plant1: {
            Image: 'LayoutComponents/Plant1.webp',
            Size: new Vector2(15, 15),
            MinSize: new Vector2(10, 10),
        },
        Plant2: {
            Image: 'LayoutComponents/Plant2.webp',
            Size: new Vector2(15, 15),
            MinSize: new Vector2(10, 10),
        },
        Plant3: {
            Image: 'LayoutComponents/Plant3.webp',
        },
        Plant4: {
            Image: 'LayoutComponents/Plant4.webp',
        },
        Sink: {
            Image: 'LayoutComponents/Sink.webp',
            Size: new Vector2(15, 10),
        },
        Toilet: {
            Image: 'LayoutComponents/Toilet.webp',
            Size: new Vector2(15, 15),
        },
        Urinal: {
            Image: 'LayoutComponents/Urinal.webp',
            Size: new Vector2(10, 10),
        },
    }
}

export default LayoutConfigs