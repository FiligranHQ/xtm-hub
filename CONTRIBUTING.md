# Contributing to XTM Hub

Thank you for reading this documentation and considering making your contribution to the project. Any contribution that helps us improve the platform is valuable and much appreciated.

In order to help you understand the project, where we are heading and how you can contribute, below are several resources and answers.

Do not hesitate to shoot us an [email](mailto:contact@filigran.io) or join us on our [Slack channel](https://community.filigran.io). Most of the articles below are an introduction for our [detailed documentation](https://docs.hub.filigran.io/latest/).


## Why contribute?

[XTM Hub](https://filigran.io/solutions/xtm-hub/) is the **unified entry point** for Filigran's ecosystem.
It allows community members, prospects and customers to easily discover our offerings, access resources, and engage with one another (if you want to know more about XTM Hub, you can read the [detailed documentation](https://docs.hub.filigran.io/latest/)).

Whether you are an organisation or an individual working or studying in the field of cybersecurity and cyberdefense, or simply as an individual looking for a technical challenge, contributing to the XTM Hub project may represent a great opportunity for you.

* You will be able to adapt the tool to your core interests and methods of work by developing features or fixing bugs you are most interested in.


## Code of Conduct

XTM Hub has adopted a Code of Conduct that we expect project participants to adhere to. Please read the [full text](https://github.com/FiligranHQ/xtm-hub/blob/main/CODE_OF_CONDUCT.md) so that you can understand which actions will and will not be tolerated.


## How can you contribute?

Any contribution is appreciated, and many don’t imply coding. Contributions can range from a suggestion for improving documentation, requesting a new feature, reporting a bug, to developing features or fixing bugs yourself.

For general suggestions or questions about the project or the documentation, you can open an issue on the repository with the label "question". We will answer as soon as possible. If you do not wish to publish on the repository, please see the section below [**"How can you get in touch for other questions?"**](#howcanyougetintouchforotherquestions).

* Just using XTM Hub and opening issues if everything is not working as expect will be a huge step forward. See our section about opening an issue. To report a bug, please refer to the [bug reporting module](https://github.com/FiligranHQ/xtm-hub/issues/new?template=bug_report.md). To suggest a new feature, please fill in the feature request [form](https://github.com/FiligranHQ/xtm-hub/issues/new?template=feature_request.md).

* Don’t hesitate to flag us an issue with the documentation or the templates if you find them incomplete or not clear enough. You can do that either by opening a [bug report](https://github.com/FiligranHQ/xtm-hub/issues/new?template=bug_report.md) or by sending us a message on our [Slack channel](https://community.filigran.io).

* You can look through opened issues and help triage them (ask for more information, suggest workarounds, suggest label, flag issues etc.)

* If you are interested in contributing to the development of XTM Hub, please refer to the [detailed documentation](https://docs.hub.filigran.io/latest/). You can either fix an issue that is meaningful to you or develop a feature requested by others.

* All commit and Pull Request titles follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) convention — see the **Commit, pull request & issue conventions** section below. The old `[package]` bracket prefix is **discontinued**; use the package (`backend`, `frontend`, `doc`) as the lowercase scope instead (e.g. `feat(frontend): add card component (#123)`).


### How can you get in touch for other questions?

If you need support or you wish to engage a discussion about the XTM Hub platform, feel free to join us on our [Slack channel](https://community.filigran.io). You can also send us an [email](mailto:contact@filigran.io).


<!-- filigran-conventions:start -->
## Commit, pull request & issue conventions

To keep the backlog consistent and searchable across all Filigran projects, this
repository follows a shared title and label convention. The full taxonomy lives
in [`.github/LABELS.md`](.github/LABELS.md). In short:

* **Titles** — All commit, pull request and issue titles follow the
  [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  specification with a GitHub issue reference:
  `type(scope?)!?: description (#issue)` (e.g.
  `feat(api): add bulk export endpoint (#1234)`). The description starts with a
  lowercase letter and has no trailing period; preserve acronyms and proper
  nouns. Types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`,
  `test`, `build`, `ci`, `revert`.

* **No more bracket prefixes** — The old `[backend]` / `[frontend]` /
  `[component]` prefixes are **discontinued**; use a Conventional Commits scope
  instead (e.g. `fix(backend): ...`).

* **GitHub reference** — Pull request titles **must** end with the related issue
  reference, e.g. `(#1234)` (the PR title becomes the squash-merge commit). Every
  pull request must be linked to an issue. Enforcement is preventive and applied
  at the organization level; **Renovate** pull requests are exempt.

* **Signed commits** — All commits must be signed. See the
  [GitHub documentation on signing commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits).

* **Labels** — Every **issue** carries one primary type label matching its title
  prefix (`feature` for `feat:`, `bug` for `fix:`, `documentation` for `docs:`)
  plus optional area labels, and its GitHub **Type** (Feature / Bug / Task) set
  to match. **Pull requests do not carry a primary type label** (the `type:`
  title prefix already conveys the type), but they should carry an **ownership**
  label — `filigran team` or `community` — to differentiate the author, plus any
  useful area/scope labels. Do not use the deprecated `enhancement` /
  `feature request` labels — use `feature`. See
  [`.github/LABELS.md`](.github/LABELS.md) for the shared palette
  ([`.github/labels.yml`](.github/labels.yml)).
<!-- filigran-conventions:end -->
