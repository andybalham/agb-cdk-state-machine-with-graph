/* eslint-disable import/first */
import { expect } from 'chai';
import cdk = require('@aws-cdk/core');
import sfn = require('@aws-cdk/aws-stepfunctions');
import * as sfnTasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as lambda from '@aws-cdk/aws-lambda';
import StateMachineWithGraph from '../src';

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

  it('renders to graph JSON with CDK token', async () => {
    //
    const stack = new cdk.Stack();

    const stateMachine = new StateMachineWithGraph(stack, 'LambdaInvoke-CDK', {
      replaceCdkTokens: true,
      getDefinition: (definitionScope): sfn.IChainable => {
        //
        const function1 = new lambda.Function(definitionScope, 'Function1', {
          runtime: lambda.Runtime.NODEJS_12_X,
          handler: 'index.handler',
          code: lambda.Code.fromInline('exports.handler = function(event, ctx, cb) { return cb(null, "hi"); }'),
        });

        const lambdaInvoke1 = new sfnTasks.LambdaInvoke(definitionScope, 'LambdaInvoke1', {
          lambdaFunction: function1,
          payload: sfn.TaskInput.fromObject({
            constant: 'ConstantValue',
            'dynamic.$': '$.dynamicValue',
          }),
        });

        const definition = sfn.Chain.start(lambdaInvoke1);

        return definition;
      },
    });

    const { graphJson } = stateMachine;

    expect(JSON.parse(graphJson)).to.deep.equal({
      StartAt: 'LambdaInvoke1',
      States: {
        LambdaInvoke1: {
          End: true,
          Retry: [
            {
              ErrorEquals: ['Lambda.ServiceException', 'Lambda.AWSLambdaException', 'Lambda.SdkClientException'],
              IntervalSeconds: 2,
              MaxAttempts: 6,
              BackoffRate: 2,
            },
          ],
          Type: 'Task',
          Resource: 'arn:CDK_TOKEN:states:::lambda:invoke',
          Parameters: {
            FunctionName: 'CDK_TOKEN',
            Payload: {
              constant: 'ConstantValue',
              'dynamic.$': '$.dynamicValue',
            },
          },
        },
      },
    });
  });
});
