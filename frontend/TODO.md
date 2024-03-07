# Web Application Frontend User Stories

## Overview

This document outlines the user stories for the frontend development of our web application. The design is inspired by clean and minimal aesthetics, as depicted in the attached screenshots. The main features include managing projects and jobs, along with user profile and settings management, which are currently in progress (WIP).

## Features and User Stories

### Dashboard

- **User Story**: As a user, I want to have a dashboard where I can get an overview of my projects and jobs to manage them effectively.

### Projects

- **User Story**: As a user, I can create a project through a dialog window with a form to detail the new project.
  - **Fields**:
    - Project name
    - Description
    - Max VU Per Test (e.g., 100)
    - maxDurationPerTest (e.g., 1hr)

- **User Story**: As a user, I want to view all my projects in a card layout to easily manage and interact with them.
  - **Acceptance Criteria**: Projects are displayed in a column card layout with options to read, update, and delete.

- **User Story**: As a user, I want to click on a "View" button on a project card to show all the jobs within the project in a separate column.
  - **Acceptance Criteria**: Clicking "View" displays all associated jobs for that project.

### Jobs within a Project

- **User Story**: As a user, I can create a Job within a project through a dialog window with a form.
  - **Fields**:
    - Job name
    - Description
    - Git repository (e.g., `https://github.com/user/repo.git`)
    - Git branch (e.g., main)
    - Test file (e.g., scripts/test.js)

- **User Story**: As a user, I want to view all the jobs within a project in a card layout so that I can manage them.
  - **Acceptance Criteria**: Jobs are displayed in a column card layout with options to read, update, and delete.

- **User Story**: As a user, I can execute all jobs within a project by clicking on "Run all jobs".
  - **Acceptance Criteria**: A "Run all jobs" button initiates the execution of all jobs in a project.

- **User Story**: As a user, I can view details and make changes to a job by clicking on a “View” button on a job card.
  - **Acceptance Criteria**: "View" button reveals detailed information about the job with the ability to modify and save changes.

- **User Story**: As a user, I want to start a job by clicking on "Run job".
  - **Acceptance Criteria**: "Run job" button triggers the job execution process.

### Team (WIP)

### My Profile (WIP)

### Settings

## Design Inspiration

The application's design should be inspired by the following principles:

- Clean and minimalistic user interface.
- Card layout for projects and jobs to allow easy scanning of information.
- Intuitive forms for creating and updating projects and jobs.
- Effective use of whitespace to prevent visual clutter.
- Cohesive color scheme and typography aligned with brand guidelines.

Refer to the attached screenshots for visual guidance on the desired look and feel of the application.

