const expect = require('chai').expect;
const {graphql} = require('graphql');

const schema = require('../../../../graph/schema');
const Context = require('../../../../graph/context');
const UserModel = require('../../../../models/user');
const SettingsService = require('../../../../services/settings');
const CommentsService = require('../../../../services/comments');

describe('graph.mutations.addCommentTag', () => {
  let comment;
  beforeEach(async () => {
    await SettingsService.init();
    comment = await CommentsService.publicCreate({body: `hello there! ${  String(Math.random()).slice(2)}`});
  });

  const query = `
    mutation AddCommentTag ($id: ID!, $tag: String!) {
      addCommentTag(id:$id, tag:$tag) {
        comment {
          id
        }
        errors {
          translation_key
        }
      }
    }
  `;

  it('moderators can add tags to comments', async () => {
    const user = new UserModel({roles: ['MODERATOR' ]});
    const context = new Context({user});
    const response = await graphql(schema, query, {}, context, {id: comment.id, tag: 'BEST'});
    if (response.errors && response.errors.length) {
      console.error(response.errors);
    }
    expect(response.errors).to.be.empty;

    return CommentsService.findById(response.data.addCommentTag.comment.id)
    .then(({tags}) => {
      expect(tags).to.have.length(1);
    });
  });

  describe('users who cant add tags', () => {
    Object.entries({
      'anonymous': undefined,
      'regular commenter': new UserModel({}),
      'banned moderator': new UserModel({roles: ['MODERATOR'], status: 'BANNED'})
    }).forEach(([ userDescription, user ]) => {
      it(userDescription, async function () {
        const context = new Context({user});
        const response = await graphql(schema, query, {}, context, {id: comment.id, tag: 'BEST', privacy_type: 'PUBLIC'});
        if (response.errors && response.errors.length) {
          console.error(response.errors);
        }
        expect(response.errors).to.be.empty;
        expect(response.data.addCommentTag.errors).to.deep.equal([{'translation_key':'NOT_AUTHORIZED'}]);
        expect(response.data.addCommentTag.comment).to.be.null;
      });
    });
  });

});
