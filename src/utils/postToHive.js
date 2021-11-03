const postToHive = function(parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata){
  let enforce = this.$store.state.username
  let comment_options = ""
  return new Promise(resolve => {
    hive_keychain.requestPost(author, title, body, parentPermlink, parentAuthor, jsonMetadata, permlink, comment_options, function(response) {
      // console.log(123654, response)
      resolve(response)
    }, enforce)
  })

}

export {postToHive}