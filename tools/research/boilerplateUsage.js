const { abc, def } = require('./boilerplate');

//Option 1:
// async function run() {
//   await abc();
//   await def();
// }

// To run it in this script:
// run().catch((error) => {
//   console.log('An error occurred:', error);
// });

// To export the run action and use it some where else option A...
// module.exports = async () => {
//     await abc();
//     await def();
// }


// To export the run action and use it some where else option B...
// module.exports = async () => {
//     run().catch((error) => {
//     console.log('An error occurred:', error);
//     });
// }
  

//Option 2:
//To run it in this file
// (async () => {
// module.exports = async () => { abc,def };

// if (require.main === module) { 
//     await abc();
//     await def();
// }
// })();

//Option 3:
//To export the run action and use it some where else option C...
module.exports = async () => {
    abc();
    def();
}