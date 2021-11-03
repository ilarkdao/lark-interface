const hiveDelegate = async function(user, delegatee, amount){
  return new Promise(resolve => {
    hive_keychain.requestDelegation(user, delegatee, amount, 'VESTS', function(response) {
      console.log(369, response)
      resolve(response)
    })
  })
}

export {hiveDelegate}
