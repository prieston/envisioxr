/**
 * @license
 * Cesium Analytics SDK
 * Version 1.133
 *
 * Copyright 2012-2020 Cesium GS, Inc.
 * All rights reserved.
 *
 * Patents US9153063B2 US9865085B1 US9449424B2 US10592242
 * Patents pending US15/829,786 US16/850,266 US16/851,958
 *
 * Portions licensed separately.
 * See https://github.com/CesiumGS/cesium/blob/main/LICENSE.md for open-source Cesium license.
 */

import{a as l,b as p,c as s,d as y,e as D,f as _,g,h as x,i as b,j as F,k as O,l as v,m as E}from"./chunk-XE37ROUK.js";var i=new s;function A(e){if(e=e??y.EMPTY_OBJECT,!l(e.directions))throw new p("options.directions is required");if(!e.perDirectionRadius&&!l(e.radius))throw new p("options.radius is required when options.perDirectionRadius is undefined or false.");this._radius=e.radius,this._directions=e.directions,this._perDirectionRadius=e.perDirectionRadius,this._numberOfRings=e.numberOfRings??6,this._vertexFormat=e.vertexFormat??E.DEFAULT,this._workerPath=_("IonSdkGeometryWorkers/createFanOutlineGeometry.js")}A.createGeometry=function(e){if(!l(e))throw new p("fanGeometry is required");let S=e._radius,C=l(e._perDirectionRadius)&&e._perDirectionRadius,R=e._directions,G=e._vertexFormat,a=e._numberOfRings,t,r,n,u,f=0,d,c=R.length,w=new v;if(G.position){for(r=0,u=c*3*a,d=new Float64Array(u),n=0;n<a;n++)for(t=0;t<c;t++){i=s.fromSpherical(R[t],i);let o=C?s.magnitude(i):S,h=o/a*(n+1);i=s.normalize(i,i),d[r++]=i.x*h,d[r++]=i.y*h,d[r++]=i.z*h,f=Math.max(f,o)}w.position=new F({componentDatatype:x.DOUBLE,componentsPerAttribute:3,values:d})}r=0,u=c*2*a;let m=D.createTypedArray(u/3,u);for(n=0;n<a;n++){let o=n*c;for(t=0;t<c-1;t++)m[r++]=t+o,m[r++]=t+1+o;m[r++]=t+o,m[r++]=0+o}return new b({attributes:w,indices:m,primitiveType:g.LINES,boundingSphere:new O(s.ZERO,f)})};var T=A;var q=T.createGeometry;export{q as default};
