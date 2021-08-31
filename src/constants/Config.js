const Config = {
    apiDomain:              'https://foodplan.site/api/',
    version:                '1.0',
    appName:                'Lombardist',
    urlTile:                'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
    newSlideInUp :{
      0: {
        opacity: 0,
        translateY: 0
      },
      0.5: {
        opacity: 0,
        translateY: 100,
      },
      1: {
        opacity: 1,
        translateY: 0,
      }
    }
  };
  
  export default Config;
  