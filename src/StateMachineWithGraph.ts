import { Stack, aws_stepfunctions as sfn } from 'aws-cdk-lib';
import { StateMachineProps } from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

export interface StateMachineWithGraphProps extends Omit<StateMachineProps, 'definition'> {
  replaceCdkTokens?: boolean;
  getDefinition: (scope: Construct) => sfn.IChainable;
}

export default class StateMachineWithGraph extends sfn.StateMachine {
  //
  readonly graphJson: string;

  constructor(scope: Construct, id: string, props: StateMachineWithGraphProps) {
    //
    super(scope, id, {
      ...props,
      definition: props.getDefinition(scope),
    });

    const stateGraph = new sfn.StateGraph(
      props.getDefinition(new Stack()).startState,
      'Temporary graph to render to JSON'
    );

    const graphJson = JSON.stringify(stateGraph.toGraphJson(), null, 2);

    this.graphJson = props.replaceCdkTokens ? graphJson.replace(/\$\{Token\[[^\]]+\]}/g, 'CDK_TOKEN') : graphJson;
  }
}
