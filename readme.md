# State Machine With Graph

An extension of the CDK `StateMachine` class that can output the underlying graph as JSON.

[![Build & test](https://github.com/andybalham/agb-cdk-state-machine-with-graph/actions/workflows/build-test.yml/badge.svg)](https://github.com/andybalham/agb-cdk-state-machine-with-graph/actions/workflows/build-test.yml)

# Usage

`StateMachineWithGraph` can be used in place of the CDK `StateMachine`, the only difference in usage is that a function must be supplied to return the state machine definition. This function is passed a `scope` parameter that must be used to create the states within the definition.

For example:

```TypeScript
const stack = new cdk.Stack();

const stateMachine = new StateMachineWithGraph(stack, 'Test', {
  getDefinition: (scope): sfn.IChainable =>
    sfn.Chain.start(new sfn.Pass(scope, 'Pass')),
});

console.log(stateMachine.graphJson);
```

Outputs:

```JSON
{
  "StartAt": "Pass",
  "States": {
    "Pass": {
      "Type": "Pass",
      "End": true
    }
  }
}
```

# Replacing CDK tokens

If you want the output to be consistent, e.g. for use in snapshot testing, then you can use the `replaceCdkTokens` property as shown below:

```TypeScript
const stateMachine = new StateMachineWithGraph(stack, 'TestWithResources', {
  replaceCdkTokens: true,
  getDefinition: (definitionScope): sfn.IChainable => {
```

With this set to `true`, the placeholder tokens generated by CDK are replaced with the constant value `CDK_TOKEN`. For example, if the output was being rendered as follows:

```json
  "Type": "Task",
  "Resource": "arn:${Token[AWS.Partition.7]}:states:::lambda:invoke",
  "Parameters": {
    "FunctionName": "${Token[TOKEN.245]}",
```

Then setting `replaceCdkTokens` to `true` would result in the following:

```json
  "Type": "Task",
  "Resource": "arn:CDK_TOKEN:states:::lambda:invoke",
  "Parameters": {
    "FunctionName": "CDK_TOKEN",
```

# Troubleshooting

If you see an error message like the following, check that the `scope` parameter passed to `getDefinition` is being used to create the states in the definition:

```
Error: There is already a Construct with name 'Pass' in Stack [Default]
```
