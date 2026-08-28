# Free trials

## Start an OpenCTI free trial

Starting a trial gives users access to a dedicated OpenCTI Enterprise Edition product for 30 days.
Each organization is generally entitled to only one free trial. Trials cannot be started for personal organizations.

If Filigran does not have enough capacity to host the trial in the requested region, the user will be notified and 
may either select a different region or join a waiting list for the preferred region.

### Trial Statuses

The status of a trial is shown on its details page. It can be one of the following:

| Status       | Description                                                                                                                        |
|--------------|------------------------------------------------------------------------------------------------------------------------------------|
| Active       | The trial is on-going                                                                                                              | 
| Pending      | The trial request has been submitted and is awaiting internal validation to be deployed.                                           |
| Provisioning | The trial request is getting provisioned.                                                                                          |
| Requested    | Trial quotas have been reached. <br>The trial is placed on a waiting list and user will be notified once a slot becomes available. |                                                                                                                           |
| Cancelled    | The trial has been cancelled.                                                                                                      |
| Failed       | The trial provisioning failed due to some technical reasons.                                                                       |
| Expired      | The trial period has ended and access is no longer active.                                                                         |

### Enterprise License

The trial comes with an EE license, with all the EE functionalities from OpenCTI: 

[OpenCTI Enterprise Documentation](https://docs.opencti.io/latest/administration/enterprise/?h=edition)

### Trial Duration

All standard trials last **30 days**. The trial’s start and end dates are displayed on the trial's details page.

### Cancellation
You can cancel your free trial at any time from the trial details page.
If the trial has not yet reached **Active** status, you will be able to request a new one.
If Filigran encounters operational capacity limitations, your trial might be cancelled before its scheduled end date.

## Contact Us

Selecting **Contact Us**, from XTM-HUB, or from the free trial product, sends the user’s inquiry directly to our **Sales team**.

Use this option for questions related to licensing, enterprise packages, pricing, or expansions.


## Manage users on your OpenCTI free trial

Once OpenCTI is activated, administrators in your organization will have the ability to grant access to other users. By default, the user requesting the trial will be assigned the admin role.

![opencti-free-trial-page.png](../assets/images/opencti-free-trial-page-details.png)

On this page, click on "Manage Users" to open a drawer where you can assign roles to users within your organization.

![opencti-free-trial-manage-user.png](../assets/images/opencti-free-trial-manage-user.png)

Only users with an assigned role will be able to access the free trial product.
After assigning roles, users can log in using the same credentials as their XTM Hub account.

### User Group Mapping (Hub → OpenCTI)!
To ensure consistent permissions across systems, user roles in XTM Hub map directly to your OpenCTI free trial roles:

- **Reader**: A read-only role that allows access to view all data in the product without the ability to make any modifications. Ideal for users who only need to consume information.

- **Admin**: The administrator role with full access to product settings, configuration, and management. Admins can manage users, roles, and system-wide settings, in addition to having full visibility and control over the data.

- **Analyst**: A role with full access to all knowledge within the product. Analysts can create, edit, and manage entities, relationships, and investigations, but do not have access to product settings, administration, or configuration options.

