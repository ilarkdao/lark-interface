const unlockWallet = async function(){
  let accounts = await ethereum.request({ method: 'eth_requestAccounts' })
  let addr = accounts[0]
  // console.log(124, addr)
  if(addr !== this.$store.state.addr){
    alert("请切换地址帐号！\n" + this.$store.state.addr)
  }
}

export {unlockWallet}
