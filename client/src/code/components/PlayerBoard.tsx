import React, { CSSProperties, ReactElement } from "react";

/*folder with images, which will be loaded dynamically;
  check webpack dynamic import
*/
const requestImageFile = require.context("../../img", true, /.png$/, 'sync');


const PlayerBoard = ({ state }: any) => {
  
    /* tiles format is 83x99px
      Width 72px; Height 88px; Shadow 11x11px
    */
    const tileWidth: number = 72;
    const tileHeight: number = 88;
    const tileShadowWidth: number = 11;
    const tileShadowHeight: number = 11;

    const xAdjust: number = 10;
    const yAdjust: number = 36;

    const tiles: React.ReactElement[] = [ ];

    let xOffset: number = 0;
    let yOffset: number = 0;

    for (let l: number = 0; l < state.layout.length; l++) {
        xOffset = xOffset + tileShadowWidth;
        yOffset = yOffset - tileShadowHeight;
        
        const layer: number[][] = state.layout[l];
        for (let r: number = 0; r < layer.length; r++) {
            const row: number[] = layer[r];
            for (let c: number = row.length; c >= 0; c--) {
                let tileVal: number = row[c];

                //render only tiles with values
                if (tileVal > 0) {
                    const xLoc: number = ((c * tileWidth) - (c * tileShadowWidth)) + xOffset + xAdjust;
                    const yLoc: number = ((r * tileHeight) - (r * tileShadowHeight)) + yOffset + yAdjust;

                    const style: CSSProperties = { 
                      position : "absolute",
                      left : `${xLoc}px`,
                      top : `${yLoc}px`
                    }

                    let className: string = "";
                  
                    //border for move help
                    if (tileVal > 600 && tileVal < 700) {
                        className = "borderCustom";
                        tileVal = tileVal - 500;
                    }
                    //border for selected tiles
                    else if (tileVal > 1000 && tileVal < 1500) {
                        className = "borderCustom";
                        tileVal = tileVal - 1000;
                    }
                    //tiles have value > 1500 when they are selected before helping value is removed 
                    else if (tileVal > 1500) {
                        className = "borderCustom";
                        tileVal = tileVal - 1500;
                    }
                  
                    //rendered images are added to tiles container; dynamic import
                    tiles.push(
                      <img style={style} 
                      src={requestImageFile(`./tile${tileVal}.png`)} 
                      className={className} 
                      onClick={()=>state.tileClick(l, r, c)} 
                      alt="" />
                    )
                } // (tileVal > 0)
            }// for (let c: number = row.length; c >= 0; c--) 
        }// for (let r: number = 0; r < layer.length; r++)
    }// for (let l: number = 0; l < state.layout.length; l++)
    
    return (
      <React.Fragment>{ tiles }</React.Fragment>
    )
}


export default PlayerBoard;