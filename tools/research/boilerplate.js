const abc = async () => {
  console.log('abc')
}

const def = async () => {
  console.log('def')
}

(async () => {
module.exports = { abc,def };

if (require.main === module) { 
  await abc();
  await def();
}
})();


