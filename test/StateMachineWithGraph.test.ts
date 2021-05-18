import cdk = require('@aws-cdk/core');
import sfn = require('@aws-cdk/aws-stepfunctions');
import StateMachineWithGraph from '../src';
import { expect } from 'chai';

describe('StateMachineWithGraph outputs graph JSON', () => {
  it('renders to graph JSON', async () => {
    //
    const stack = new cdk.Stack();

    const stateMachine = new StateMachineWithGraph(stack, 'Test', {
      getDefinition: (scope): sfn.IChainable => sfn.Chain.start(new sfn.Pass(scope, 'Pass')),
    });

    expect(JSON.parse(stateMachine.graphJson)).to.deep.equal({
      StartAt: 'Pass',
      States: {
        Pass: {
          Type: 'Pass',
          End: true,
        },
      },
    });
  });
});
