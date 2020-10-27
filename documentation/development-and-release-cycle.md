# Release and Development Cycle

## LINK Resources

The following links are resources provided by SFCC and the LINK team, with lots of information about the certification, release, and development processes for LINK cartridges. Most of these require authentication in the Partner Community or XChange.

* [LINK GitHub Instructions](https://partners.salesforce.com/0693A0000067Xv4QAE) (PDF) - Details how to gain access to the LINK GitHub repository, as well as how the repository should be structured, naming conventions, etc.
* [LINK Certification Guide](https://partners.salesforce.com/0693A0000067XvE) (PDF) - High-level overview of certification process.
* [LINK Integration Guidelines & Best Practices](https://partners.salesforce.com/0693A000007avARQAY) (PDF) - In-depth development rules and guidelines, best practices, etc.
* [B2C Documentation](https://documentation.b2c.commercecloud.salesforce.com/DOC1/index.jsp) - Documentation for OCAPI, SFCC, and various other B2C products and services (no authentication required).
* [API-Explorer (Swagger)](https://api-explorer.commercecloud.salesforce.com/?url=https://demo-ocapi.demandware.net/s/-/dw/meta/v1/rest) - OCAPI documentation NOTE: Currently does not work with Chrome; use Firefox instead.

## Development Cycle

### GitHub Repositories

**[subscribepro/sub-demandware](https://github.com/subscribepro/sub-demandware)**

* Subscribe Pro-owned repository
* Read/write access is dependent on membership of "SFCC Read/Write" team in GitHub.
* All developers' forks should be made based on this repository

**[SalesforceCommerceCloud/link_subscribepro](https://github.com/SalesforceCommerceCloud/link_subscribepro)**

* Repository owned by SalesforceCommerceCloud GitHub organization
* Read/write access is dependent on membership to SalesforceCommerceCloud GitHub organization
* Should mirror subscribepro/sub-demandware

### Local Environment Setup

1. In GitHub, fork the [`subscribepro/sub-demandware`](https://github.com/subscribepro/sub-demandware) repository to your own GitHub account.
2. On your local system, create a folder to contain the project. This folder will contain multiple Git repositories. For instance, `~/Projects/SFCC`. The folder name does not matter.
3. In the directory created in the previous step, clone your fork of the [`subscribepro/sub-demandware`](https://github.com/subscribepro/sub-demandware) repository, naming the folder `link_subscribepro`.
4. Also, clone the [`SalesforceCommerceCloud/link_subscribepro`](https://github.com/SalesforceCommerceCloud/link_subscribepro) repository as a sibling to the `link_subscribepro` repository.
5. Change into the `link_subscribepro` directory and run npm install to set up dependencies.
6. Create a file called `dw.json` in the link_subscribepro folder and enter the following JSON object, changing the details to connect to your sandbox. This is primarily used for uploading your cartridges:

    ```json
        {
            "hostname": "subscribepro-tech-prtnr-na01-dw.demandware.net",
            "username": "BM User Name",
            "password": "BM User Pass",
            "code-version": "version1"
        }
    ```

7. Make sure the `sgmf-scripts` dependency was installed correctly; if not, install it directly.
8. Now, in VS Code (or your preferred IDE) open the outer folder, and you will have access to both the Subscribe Pro and SFCC cartridges.

### Development Process

* Development should take place in developers' forks of the [`subscribepro/sub-demandware`](https://github.com/subscribepro/sub-demandware) repository.
* Features and bugs should be developed in individual branches specific to the issue being worked on
* Branch names should follow this naming condition: `feat-{issue}`, for example: `feat-hosted-widgets`
* After changes are tested, a pull request should be made from the branch on the fork, which can then be reviewed and merged into the `master` branch on the upstream repository.
* Appropriate tests should be created to cover new and changed code, when able.
* Developers should review and consult the [LINK Integration Guidelines & Best Practices](https://partners.salesforce.com/0693A000007avARQAY) resource above to make sure best practices are being followed.
* When the local environment is set up properly, as you develop you can use the command `sgmf-scripts --uploadCartridge {cartridge_name}` to upload changes to your sandbox for testing.

## Release Cycle

The Release Manager is responsible for checking and performing all prerequisites before releasing a new version.

### Release Prerequisites

Before these prerequisites are run, please make sure you have completed the **Local Environment Setup** above. Note that the NPM commands listed below are configured in `package.json`, so changes can be made locally to suit your needs.

#### Step 1 - Run Linting

* Linting is run using the `npm run lint` command from the repository root directory.
* This will run linting for both JS and CSS code in the cartridges. No errors or warnings should be displayed.

#### Step 2 - Run Compilation

* Compilation is run using the `npm run compile:js` and `npm run compile:scss` commands from the repository root directory.

#### Step 3 - Run Tests

* The test suite is run using the `npm test` command from the repository root directory.
* Tests are contained in the `/test/unit/int_subscribe_pro_sfra` directory and currently cover the helper script functionality.

#### Step 4 - Lifecycle Test

* A [full subscription life cycle test](https://docs.subscribepro.com/users/testing/full-subscription-life-cycle-testing/) should be run to make sure all core functionality is working as expected.

## Versioning

When significant bug fixes and/or features have been tested and confirmed, a new version may be released.

* Every release of the cartridge should be designated by a build number, starting from 1, and a GitHub release.
* When the SFCC LINK team certifies a build, they will assign an official version number to it, which will be visible from the XChange Marketplace.
* Information about how the official certified version is selected is available in the [LINK Integration Guidelines & Best Practices](https://partners.salesforce.com/0693A000007avARQAY) guide in the **LINK Resources** section.
