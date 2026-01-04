import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { AppStackProps } from '../config';

export interface DataStackTables {
  users: dynamodb.Table;
  accounts: dynamodb.Table;
  seasons: dynamodb.Table;
  holdings: dynamodb.Table;
  orders: dynamodb.Table;
  transactions: dynamodb.Table;
  symbols: dynamodb.Table;
  priceCache: dynamodb.Table;
}

export class DataStack extends cdk.Stack {
  public readonly tables: DataStackTables;

  constructor(scope: cdk.App, id: string, props: AppStackProps) {
    super(scope, id, props);

    const tableDefaults: Omit<dynamodb.TableProps, 'partitionKey'> = {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    };

    const users = new dynamodb.Table(this, 'UsersTable', {
      ...tableDefaults,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    });

    const seasons = new dynamodb.Table(this, 'SeasonsTable', {
      ...tableDefaults,
      partitionKey: { name: 'seasonId', type: dynamodb.AttributeType.STRING },
    });

    const accounts = new dynamodb.Table(this, 'AccountsTable', {
      ...tableDefaults,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'seasonId', type: dynamodb.AttributeType.STRING },
    });

    const holdings = new dynamodb.Table(this, 'HoldingsTable', {
      ...tableDefaults,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'symbol', type: dynamodb.AttributeType.STRING },
    });
    holdings.addGlobalSecondaryIndex({
      indexName: 'SymbolIndex',
      partitionKey: { name: 'symbol', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
    });

    const orders = new dynamodb.Table(this, 'OrdersTable', {
      ...tableDefaults,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'orderId', type: dynamodb.AttributeType.STRING },
    });
    orders.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
    });

    const transactions = new dynamodb.Table(this, 'TransactionsTable', {
      ...tableDefaults,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'txnId', type: dynamodb.AttributeType.STRING },
    });

    const symbols = new dynamodb.Table(this, 'SymbolsTable', {
      ...tableDefaults,
      partitionKey: { name: 'symbol', type: dynamodb.AttributeType.STRING },
    });

    const priceCache = new dynamodb.Table(this, 'PriceCacheTable', {
      ...tableDefaults,
      partitionKey: { name: 'symbol', type: dynamodb.AttributeType.STRING },
    });

    this.tables = {
      users,
      accounts,
      seasons,
      holdings,
      orders,
      transactions,
      symbols,
      priceCache,
    };

    cdk.Tags.of(this).add('App', props.config.appName);
    cdk.Tags.of(this).add('Stage', props.config.stage);
  }
}
