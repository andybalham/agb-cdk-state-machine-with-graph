An extension of the CDK State Machine class that can output the underlying graph as JSON.

# Installing

Using npm:
```
$ npm install @andybalham/agb-state-machine-with-diagram
```

# Usage

`StateMachineWithGraph` can be used in place of the CDK `StateMachine`, the only difference in usage is that a function must be supplied to return the state machine definition. This function is passed a `scope` parameter that must be used to create the states within the definition.

For example:

```TypeScript
const stack = new cdk.Stack();

const stateMachine = new StateMachineWithGraph(stack, 'Test', {
  getDefinition: (scope): sfn.IChainable => sfn.Chain.start(new sfn.Pass(scope, 'Pass')),
});

console.log(stateMachine.graphJson});
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

# Troubleshooting

If you see an error message like the following, check that the `scope` parameter passed to `getDefinition` is being used to create the states in the definition:

```
Error: There is already a Construct with name 'Pass' in Stack [Default]
```