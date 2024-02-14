# Kratos Meter (Load Testing)

KratosMeter is a robust load testing tool designed to ensure the resilience and performance of your applications under heavy load. Inspired by the Greek deity Kratos, this tool embodies strength and power, offering detailed insights into how well your services can scale and handle concurrent users.

## Features

- **Easy-to-define Test Scenarios**: Write your load tests in a simple, understandable format.
- **Scalable**: Easily scale your tests to simulate thousands of users.
- **Integration with Temporal**: Leverages Temporal for reliable and scalable orchestration of test jobs.
- **Real-time Metrics**: Monitor your tests in real-time with integrated Grafana dashboards.

## How it works

1. Job Creation
Client Request: The process starts when a client (e.g., a user through a UI or an automated script) sends a request to create a new load testing job. This request is typically a POST request to an endpoint like /jobs with job details in the request body.

Server Endpoint: The server's job creation endpoint receives the request. It's handled by a Gin handler function that validates the request data, creates a job record (e.g., in MongoDB), and then initiates a Temporal workflow to manage the job's execution.

Database Record: The job details are stored in MongoDB, including a unique job ID, the job's configuration, and its initial status (e.g., "Pending" or "Initialized").

Temporal Workflow: The server starts a Temporal workflow for the new job. This workflow manages the job's lifecycle, including its execution by workers, monitoring, and result processing.

2. Job Execution
Temporal Worker: A Temporal worker, which is a separate component or service, picks up the job from the Temporal task queue. The worker is responsible for executing the load testing job according to its configuration.

Job Execution: The worker performs the load testing job, which might involve generating load on a target system, collecting metrics, and monitoring the test's progress.

Result Processing: After the job execution is complete, the worker processes the results. This might involve aggregating metrics, analyzing the outcomes, and potentially storing the results in a database for later retrieval.

Workflow Completion: The Temporal workflow associated with the job updates the job's status in the database to reflect the completion of the job and the outcome (e.g., "Completed", "Failed").

```bash
Client Request
      |
      v
Server Endpoint (Gin) --> Validate Request --> Store Job in MongoDB --> Start Temporal Workflow
      |
      v
Temporal Worker Picks Up Job
      |
      v
Execute Load Test (Worker)
      |
      v
Process Results (Worker) --> Update Job Status in MongoDB
      |
      v
Workflow Completion

```
